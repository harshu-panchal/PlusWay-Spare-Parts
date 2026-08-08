/**
 * CountryPricingContext.jsx
 *
 * Provides location-based pricing to all customer-facing components.
 *
 * On mount:
 *   1. Detects the user's country via /api/customer/geo/country (geoip-lite, offline)
 *   2. Fetches live INR-based exchange rates from /api/customer/exchange-rates
 *      (sourced from open.er-api.com, cached 24h on the backend)
 *   3. Stores both in sessionStorage so subsequent navigations are instant
 *
 * Exposes:
 *   countryInfo   — { countryCode, countryName, currencyCode, currencySymbol }
 *   exchangeRates — { INR: 1, AED: 0.044, USD: 0.012, ... }
 *   loading       — boolean, true until initial fetch completes
 *   getPriceForCountry(product, variant?) — returns effective pricing for current country
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";

const CountryPricingContext = createContext(null);

// India is the default — all existing products have INR prices
const INDIA_DEFAULT = {
  countryCode: "IN",
  countryName: "India",
  currencyCode: "INR",
  currencySymbol: "₹",
};

const SESSION_KEY_COUNTRY = "pw_countryInfo";
const SESSION_KEY_RATES   = "pw_exchangeRates";
const SESSION_KEY_EXPIRES  = "pw_sessionExpires";
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour (rates refresh in 24h server-side anyway)

export const CountryPricingProvider = ({ children }) => {
  const [countryInfo,    setCountryInfo]    = useState(INDIA_DEFAULT);
  const [exchangeRates,  setExchangeRates]  = useState({ INR: 1 });
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    const initPricing = async () => {
      // 0. Check URL search param for testing override (e.g. ?country=AR)
      const urlParams = new URLSearchParams(window.location.search);
      const urlCountry = urlParams.get("country");

      try {
        const cachedCountry = sessionStorage.getItem(SESSION_KEY_COUNTRY);
        const cachedRates   = sessionStorage.getItem(SESSION_KEY_RATES);

        if (urlCountry) {
          // If URL specifies country, fetch rates and set requested country
          const ratesRes = await fetch(API_ENDPOINTS.EXCHANGE_RATES);
          const rData = ratesRes.ok ? await ratesRes.json() : { rates: { INR: 1 } };
          const rates = rData.rates || { INR: 1 };
          
          const geoRes = await fetch(`${API_ENDPOINTS.GEO_COUNTRY}?country=${encodeURIComponent(urlCountry)}`);
          const geo = geoRes.ok ? await geoRes.json() : INDIA_DEFAULT;

          setCountryInfo(geo);
          setExchangeRates(rates);
          sessionStorage.setItem(SESSION_KEY_COUNTRY, JSON.stringify(geo));
          sessionStorage.setItem(SESSION_KEY_RATES, JSON.stringify(rates));
          sessionStorage.setItem(SESSION_KEY_EXPIRES, String(Date.now() + SESSION_TTL_MS));
          setLoading(false);
          return;
        }

        if (cachedCountry) {
          const parsedCountry = JSON.parse(cachedCountry);
          setCountryInfo(parsedCountry);
          if (cachedRates) {
            setExchangeRates(JSON.parse(cachedRates));
            setLoading(false);
            return;
          }
        }
      } catch (_) {
        // Continue to fetch if session parse fails
      }

      // Fetch geo + exchange rates in parallel
      try {
        const [geoRes, ratesRes] = await Promise.all([
          fetch(API_ENDPOINTS.GEO_COUNTRY),
          fetch(API_ENDPOINTS.EXCHANGE_RATES),
        ]);

        const geo   = geoRes.ok   ? await geoRes.json()   : INDIA_DEFAULT;
        const rData = ratesRes.ok ? await ratesRes.json() : { rates: { INR: 1 } };
        const rates = rData.rates || { INR: 1 };

        setCountryInfo(geo);
        setExchangeRates(rates);

        try {
          sessionStorage.setItem(SESSION_KEY_COUNTRY, JSON.stringify(geo));
          sessionStorage.setItem(SESSION_KEY_RATES,   JSON.stringify(rates));
          sessionStorage.setItem(SESSION_KEY_EXPIRES,  String(Date.now() + SESSION_TTL_MS));
        } catch (_) {}
      } catch (err) {
        console.warn("[CountryPricing] Failed to fetch geo/rates, using India default:", err.message);
      } finally {
        setLoading(false);
      }
    };

    initPricing();
  }, []);

  /**
   * Convert a number from INR to the current country's currency.
   * Returns 0 for falsy inputs. Rounds to 2 decimal places.
   */
  const convertFromINR = (inrAmount) => {
    if (!inrAmount) return 0;
    const rate = exchangeRates[countryInfo.currencyCode] || 1;
    const converted = inrAmount * rate;
    // For high-value currencies (JPY, IDR, VND, KRW, etc.) avoid showing ".00"
    return parseFloat(converted.toFixed(2));
  };

  /**
   * Format a price number for display.
   * - Large integers (e.g. JPY 580, IDR 90000): no decimals
   * - Normal decimals (USD 54.12): 2 decimal places
   */
  const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return "0";
    if (Number.isInteger(amount) || amount >= 100) {
      return Math.round(amount).toLocaleString();
    }
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  /**
   * Get effective pricing for a product or variant for the current country.
   *
   * Priority order:
   *   1. Manual override in source.countryPricing[] for the detected countryCode
   *   2. Auto-convert the source's base INR price fields using live exchange rate
   *   3. If source has no price at all, fall through to product-level
   *
   * @param {Object} product  - the full product object (always required)
   * @param {Object} [variant] - a colorVariant object (optional; if provided, variant pricing takes priority)
   * @returns {{
   *   price: number,
   *   mrp: number,
   *   wholesalePrice: number,
   *   wholesaleMinQty: number,
   *   currencySymbol: string,
   *   currencyCode: string,
   *   countryName: string,
   *   isConverted: boolean,
   *   isOverride: boolean,
   * }}
   */
  const getPriceForCountry = (product, variant = null) => {
    const code   = countryInfo?.countryCode || "IN";
    const sym    = countryInfo?.currencySymbol || "₹";
    const cur    = countryInfo?.currencyCode   || "INR";
    const name   = countryInfo?.countryName    || "India";
    const isIndia = cur === "INR";

    // 1. Check variant-level manual override (if variant provided)
    if (variant && Array.isArray(variant.countryPricing) && variant.countryPricing.length > 0) {
      const vOverride = variant.countryPricing.find(
        (cp) => cp.countryCode?.toUpperCase() === code.toUpperCase()
      );
      if (vOverride) {
        return {
          price:           vOverride.price           ?? 0,
          mrp:             vOverride.mrp             ?? 0,
          wholesalePrice:  vOverride.wholesalePrice  ?? 0,
          wholesaleMinQty: vOverride.wholesaleMinQty ?? variant.wholesaleMinQty ?? product.wholesaleMinQty ?? 10,
          currencySymbol:  vOverride.currencySymbol  || sym,
          currencyCode:    vOverride.currencyCode    || cur,
          countryName:     name,
          isConverted:     false,
          isOverride:      true,
        };
      }
    }

    // 2. Check product-level manual override
    if (product && Array.isArray(product.countryPricing) && product.countryPricing.length > 0) {
      const pOverride = product.countryPricing.find(
        (cp) => cp.countryCode?.toUpperCase() === code.toUpperCase()
      );
      if (pOverride) {
        return {
          price:           pOverride.price           ?? 0,
          mrp:             pOverride.mrp             ?? 0,
          wholesalePrice:  pOverride.wholesalePrice  ?? 0,
          wholesaleMinQty: pOverride.wholesaleMinQty ?? product.wholesaleMinQty ?? 10,
          currencySymbol:  pOverride.currencySymbol  || sym,
          currencyCode:    pOverride.currencyCode    || cur,
          countryName:     name,
          isConverted:     false,
          isOverride:      true,
        };
      }
    }

    // 3. Auto-convert from INR
    const source = variant || product;
    const basePrice          = (source.price          != null ? source.price          : product.price)          ?? 0;
    const baseMrp            = (source.mrp            != null ? source.mrp            : product.mrp)            ?? 0;
    const baseWholesalePrice = (source.wholesalePrice  != null ? source.wholesalePrice : product.wholesalePrice) ?? 0;
    const baseMinQty         = source.wholesaleMinQty ?? product.wholesaleMinQty ?? 10;

    if (isIndia) {
      return {
        price:           basePrice,
        mrp:             baseMrp,
        wholesalePrice:  baseWholesalePrice,
        wholesaleMinQty: baseMinQty,
        currencySymbol:  "₹",
        currencyCode:    "INR",
        countryName:     "India",
        isConverted:     false,
        isOverride:      false,
      };
    }

    return {
      price:           convertFromINR(basePrice),
      mrp:             convertFromINR(baseMrp),
      wholesalePrice:  convertFromINR(baseWholesalePrice),
      wholesaleMinQty: baseMinQty,
      currencySymbol:  sym,
      currencyCode:    cur,
      countryName:     name,
      isConverted:     true,
      isOverride:      false,
    };
  };

  return (
    <CountryPricingContext.Provider value={{
      countryInfo,
      exchangeRates,
      loading,
      getPriceForCountry,
      convertFromINR,
      formatPrice,
    }}>
      {children}
    </CountryPricingContext.Provider>
  );
};

export const useCountryPricing = () => {
  const ctx = useContext(CountryPricingContext);
  if (!ctx) throw new Error("useCountryPricing must be used inside <CountryPricingProvider>");
  return ctx;
};

export default CountryPricingContext;
