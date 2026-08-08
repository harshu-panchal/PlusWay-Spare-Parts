/**
 * geoController.js
 *
 * Safe, zero-crash Geo Location & Exchange Rate Controller.
 *
 * Country Resolution Strategy:
 *   1. Try dynamic import of `geoip-lite` (if package is installed locally).
 *   2. If `geoip-lite` is missing or fails (e.g. localhost/private IP), fetch country
 *      code from free public API (ip-api.com / api.country.is) with in-memory caching.
 *   3. If all fail or client is local, fall back to "IN" (India default).
 *
 * Exchange Rate Strategy:
 *   - Sourced from free open.er-api.com (no API key required).
 *   - Cached in-memory server-side for 24 hours.
 */

import axios from "axios";
import { getCountryInfo } from "../../../utils/countryCurrencyMap.js";
import { getExchangeRates } from "../../../services/exchangeRateService.js";

// Try loading geoip-lite dynamically so missing package never crashes server on startup
let geoip = null;
try {
  geoip = (await import("geoip-lite")).default;
} catch (_) {
  console.log("[geoController] geoip-lite package not loaded — using API fallback mode.");
}

// In-memory cache for IP → Country lookups when using API fallback
const ipCache = new Map();
const IP_CACHE_MAX = 5000;

/**
 * Helper to test if IP is a private/loopback IPv4/IPv6 address.
 */
const isPrivateIp = (ip) => {
  if (!ip) return true;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  );
};

/**
 * @desc    Detect visitor's country from IP address.
 *          Returns country name, ISO code, currency code and symbol.
 * @route   GET /api/customer/geo/country
 * @access  Public
 */
export const getCountry = async (req, res) => {
  try {
    // 0. Explicit query param or header override for testing (e.g. ?country=AR)
    const testCountry = req.query.country || req.headers["x-test-country"];
    if (testCountry) {
      return res.json(getCountryInfo(testCountry));
    }

    const rawIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "";
    const ip = rawIp.replace(/^::ffff:/, "");

    // 1. If IP is private/loopback, default to India
    if (isPrivateIp(ip)) {
      return res.json(getCountryInfo("IN"));
    }

    // 2. Try geoip-lite if loaded
    if (geoip) {
      const geo = geoip.lookup(ip);
      if (geo?.country) {
        return res.json(getCountryInfo(geo.country));
      }
    }

    // 3. Check in-memory IP cache
    if (ipCache.has(ip)) {
      return res.json(getCountryInfo(ipCache.get(ip)));
    }

    // 4. API Fallback (free public IP API — ip-api.com)
    try {
      const apiRes = await axios.get(`http://ip-api.com/json/${ip}?fields=countryCode`, { timeout: 3000 });
      if (apiRes.data?.countryCode) {
        const code = apiRes.data.countryCode;
        if (ipCache.size > IP_CACHE_MAX) ipCache.clear();
        ipCache.set(ip, code);
        return res.json(getCountryInfo(code));
      }
    } catch (_) {}

    // 5. Default fallback to India
    return res.json(getCountryInfo("IN"));
  } catch (err) {
    console.error("[geoController.getCountry] Error:", err.message);
    return res.json(getCountryInfo("IN"));
  }
};

/**
 * @desc    Return latest exchange rates with INR as base currency.
 * @route   GET /api/customer/exchange-rates
 * @access  Public
 */
export const getExchangeRatesHandler = async (req, res) => {
  try {
    const rates = await getExchangeRates();
    return res.json({ base: "INR", rates });
  } catch (err) {
    console.error("[geoController.getExchangeRates] Error:", err.message);
    return res.status(500).json({ message: "Failed to fetch exchange rates" });
  }
};
