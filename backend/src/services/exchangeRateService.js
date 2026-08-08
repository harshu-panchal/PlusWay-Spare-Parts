/**
 * exchangeRateService.js
 *
 * Fetches USD/INR-based exchange rates from the free open.er-api.com API.
 * No API key required. Rates are cached in-memory for 24 hours to avoid
 * hammering the free tier. Falls back to a hardcoded approximate-rate table
 * if the external API is unreachable and there is no cached data yet.
 */

import axios from "axios";

const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/INR";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache
let _ratesCache = null;
let _lastFetched = null;
let _fetchInProgress = null; // Promise guard to prevent stampedes

/**
 * Minimal fallback rates (INR base) used ONLY when the API is unreachable
 * and no cached data exists yet. Values are approximate and intentionally
 * conservative — they will be replaced by live rates on the next successful
 * fetch. Rates represent "how many units of currency X per 1 INR".
 */
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  AED: 0.044,
  EUR: 0.011,
  GBP: 0.0095,
  SAR: 0.045,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
  JPY: 1.78,
  CNY: 0.087,
  MYR: 0.054,
  THB: 0.42,
  IDR: 194,
  PKR: 3.35,
  BDT: 1.32,
  LKR: 3.7,
  NPR: 1.6,
  QAR: 0.044,
  KWD: 0.0037,
  BHD: 0.0045,
  OMR: 0.0046,
  JOD: 0.0085,
  EGP: 0.58,
  KES: 1.55,
  NGN: 18.6,
  ZAR: 0.22,
  GBP: 0.0095,
  HKD: 0.094,
  TWD: 0.39,
  KRW: 16.6,
  NZD: 0.020,
  CHF: 0.011,
  SEK: 0.126,
  NOK: 0.13,
  DKK: 0.082,
  PLN: 0.049,
  CZK: 0.275,
  HUF: 4.35,
  RON: 0.055,
  BGN: 0.022,
  RUB: 1.1,
  UAH: 0.49,
  TRY: 0.41,
  BRL: 0.067,
  MXN: 0.24,
  ARS: 12.5,
  COP: 51,
  VND: 304,
  PHP: 0.69,
  MMK: 25,
  MVR: 0.185,
  IRR: 504,
  IQD: 15.7,
  LBP: 1073,
  YER: 3.0,
  AFN: 0.86,
  DZD: 1.62,
  MAD: 0.12,
  TND: 0.037,
  GHS: 0.18,
  TZS: 32.5,
  UGX: 45.5,
  ZMW: 0.32,
  KZT: 6.1,
  ILS: 0.044,
  HKD: 0.094,
  MXN: 0.24,
  ZAR: 0.22,
};

/**
 * Returns the latest exchange rates with INR as the base currency.
 * Cached for 24 hours. Falls back to FALLBACK_RATES on error.
 *
 * @returns {Promise<Object>} rates — e.g. { INR: 1, USD: 0.012, AED: 0.044, ... }
 */
export const getExchangeRates = async () => {
  // Serve from cache if still fresh
  if (_ratesCache && _lastFetched && Date.now() - _lastFetched < CACHE_TTL_MS) {
    return _ratesCache;
  }

  // Prevent parallel fetch stampedes — reuse the in-flight promise
  if (_fetchInProgress) {
    return _fetchInProgress;
  }

  _fetchInProgress = (async () => {
    try {
      const response = await axios.get(EXCHANGE_RATE_API_URL, { timeout: 8000 });
      if (response.data?.result === "success" && response.data?.rates) {
        _ratesCache = response.data.rates;
        _lastFetched = Date.now();
        console.log("[ExchangeRate] Rates refreshed from open.er-api.com");
        return _ratesCache;
      }
      throw new Error("Unexpected API response format");
    } catch (err) {
      console.warn(`[ExchangeRate] Failed to fetch live rates: ${err.message}. Using ${_ratesCache ? "cached" : "fallback"} rates.`);
      // Return last cached rates if available, otherwise fallback
      return _ratesCache || FALLBACK_RATES;
    } finally {
      _fetchInProgress = null;
    }
  })();

  return _fetchInProgress;
};

/**
 * Convert an INR amount to a target currency.
 * Returns the converted amount rounded to 2 decimal places.
 *
 * @param {number} inrAmount
 * @param {string} targetCurrency - e.g. "AED", "USD"
 * @param {Object} [rates] - optionally pass pre-fetched rates to avoid async
 * @returns {Promise<number>}
 */
export const convertFromINR = async (inrAmount, targetCurrency, rates = null) => {
  if (!inrAmount) return 0;
  if (targetCurrency === "INR") return inrAmount;
  const ratesMap = rates || (await getExchangeRates());
  const rate = ratesMap[targetCurrency] || 1;
  return Math.round(inrAmount * rate * 100) / 100;
};
