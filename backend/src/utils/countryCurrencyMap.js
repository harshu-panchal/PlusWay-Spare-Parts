/**
 * countryCurrencyMap.js
 * Static mapping: ISO 3166-1 alpha-2 country code → country info + currency
 * Used by the geoController to resolve an IP-detected country code into
 * display name and currency, and by the admin UI for the country dropdown.
 * Includes ALL European countries (50+) plus major global destinations.
 */

export const COUNTRY_CURRENCY_MAP = {
  // ── European Countries ───────────────────────────────────────────────────
  AL: { countryName: "Albania",                        currencyCode: "ALL", currencySymbol: "L" },
  AD: { countryName: "Andorra",                        currencyCode: "EUR", currencySymbol: "€" },
  AM: { countryName: "Armenia",                        currencyCode: "AMD", currencySymbol: "֏" },
  AT: { countryName: "Austria",                        currencyCode: "EUR", currencySymbol: "€" },
  AZ: { countryName: "Azerbaijan",                     currencyCode: "AZN", currencySymbol: "₼" },
  BY: { countryName: "Belarus",                        currencyCode: "BYN", currencySymbol: "Br" },
  BE: { countryName: "Belgium",                        currencyCode: "EUR", currencySymbol: "€" },
  BA: { countryName: "Bosnia and Herzegovina",         currencyCode: "BAM", currencySymbol: "KM" },
  BG: { countryName: "Bulgaria",                       currencyCode: "BGN", currencySymbol: "лв" },
  HR: { countryName: "Croatia",                        currencyCode: "EUR", currencySymbol: "€" },
  CY: { countryName: "Cyprus",                         currencyCode: "EUR", currencySymbol: "€" },
  CZ: { countryName: "Czech Republic",                 currencyCode: "CZK", currencySymbol: "Kč" },
  DK: { countryName: "Denmark",                        currencyCode: "DKK", currencySymbol: "kr" },
  EE: { countryName: "Estonia",                        currencyCode: "EUR", currencySymbol: "€" },
  FI: { countryName: "Finland",                        currencyCode: "EUR", currencySymbol: "€" },
  FR: { countryName: "France",                         currencyCode: "EUR", currencySymbol: "€" },
  GE: { countryName: "Georgia",                        currencyCode: "GEL", currencySymbol: "₾" },
  DE: { countryName: "Germany",                        currencyCode: "EUR", currencySymbol: "€" },
  GR: { countryName: "Greece",                         currencyCode: "EUR", currencySymbol: "€" },
  HU: { countryName: "Hungary",                        currencyCode: "HUF", currencySymbol: "Ft" },
  IS: { countryName: "Iceland",                        currencyCode: "ISK", currencySymbol: "kr" },
  IE: { countryName: "Ireland",                        currencyCode: "EUR", currencySymbol: "€" },
  IT: { countryName: "Italy",                          currencyCode: "EUR", currencySymbol: "€" },
  KZ: { countryName: "Kazakhstan",                     currencyCode: "KZT", currencySymbol: "₸" },
  XK: { countryName: "Kosovo",                         currencyCode: "EUR", currencySymbol: "€" },
  LV: { countryName: "Latvia",                         currencyCode: "EUR", currencySymbol: "€" },
  LI: { countryName: "Liechtenstein",                 currencyCode: "CHF", currencySymbol: "CHF" },
  LT: { countryName: "Lithuania",                      currencyCode: "EUR", currencySymbol: "€" },
  LU: { countryName: "Luxembourg",                     currencyCode: "EUR", currencySymbol: "€" },
  MT: { countryName: "Malta",                          currencyCode: "EUR", currencySymbol: "€" },
  MD: { countryName: "Moldova",                        currencyCode: "MDL", currencySymbol: "L" },
  MC: { countryName: "Monaco",                         currencyCode: "EUR", currencySymbol: "€" },
  ME: { countryName: "Montenegro",                     currencyCode: "EUR", currencySymbol: "€" },
  NL: { countryName: "Netherlands",                    currencyCode: "EUR", currencySymbol: "€" },
  MK: { countryName: "North Macedonia",                currencyCode: "MKD", currencySymbol: "ден" },
  NO: { countryName: "Norway",                         currencyCode: "NOK", currencySymbol: "kr" },
  PL: { countryName: "Poland",                         currencyCode: "PLN", currencySymbol: "zł" },
  PT: { countryName: "Portugal",                       currencyCode: "EUR", currencySymbol: "€" },
  RO: { countryName: "Romania",                        currencyCode: "RON", currencySymbol: "lei" },
  RU: { countryName: "Russia",                         currencyCode: "RUB", currencySymbol: "₽" },
  SM: { countryName: "San Marino",                     currencyCode: "EUR", currencySymbol: "€" },
  RS: { countryName: "Serbia",                         currencyCode: "RSD", currencySymbol: "din." },
  SK: { countryName: "Slovakia",                       currencyCode: "EUR", currencySymbol: "€" },
  SI: { countryName: "Slovenia",                       currencyCode: "EUR", currencySymbol: "€" },
  ES: { countryName: "Spain",                          currencyCode: "EUR", currencySymbol: "€" },
  SE: { countryName: "Sweden",                         currencyCode: "SEK", currencySymbol: "kr" },
  CH: { countryName: "Switzerland",                    currencyCode: "CHF", currencySymbol: "CHF" },
  TR: { countryName: "Turkey",                         currencyCode: "TRY", currencySymbol: "₺" },
  UA: { countryName: "Ukraine",                        currencyCode: "UAH", currencySymbol: "₴" },
  GB: { countryName: "United Kingdom",                 currencyCode: "GBP", currencySymbol: "£" },
  VA: { countryName: "Vatican City",                   currencyCode: "EUR", currencySymbol: "€" },

  // ── Global Countries ──────────────────────────────────────────────────────
  AF: { countryName: "Afghanistan",                   currencyCode: "AFN", currencySymbol: "؋" },
  DZ: { countryName: "Algeria",                        currencyCode: "DZD", currencySymbol: "دج" },
  AR: { countryName: "Argentina",                      currencyCode: "ARS", currencySymbol: "$" },
  AU: { countryName: "Australia",                      currencyCode: "AUD", currencySymbol: "A$" },
  BH: { countryName: "Bahrain",                        currencyCode: "BHD", currencySymbol: "BD" },
  BD: { countryName: "Bangladesh",                     currencyCode: "BDT", currencySymbol: "৳" },
  BR: { countryName: "Brazil",                         currencyCode: "BRL", currencySymbol: "R$" },
  CA: { countryName: "Canada",                         currencyCode: "CAD", currencySymbol: "CA$" },
  CN: { countryName: "China",                          currencyCode: "CNY", currencySymbol: "¥" },
  CO: { countryName: "Colombia",                       currencyCode: "COP", currencySymbol: "$" },
  EG: { countryName: "Egypt",                          currencyCode: "EGP", currencySymbol: "E£" },
  GH: { countryName: "Ghana",                          currencyCode: "GHS", currencySymbol: "₵" },
  HK: { countryName: "Hong Kong",                      currencyCode: "HKD", currencySymbol: "HK$" },
  IN: { countryName: "India",                          currencyCode: "INR", currencySymbol: "₹" },
  ID: { countryName: "Indonesia",                      currencyCode: "IDR", currencySymbol: "Rp" },
  IR: { countryName: "Iran",                           currencyCode: "IRR", currencySymbol: "﷼" },
  IQ: { countryName: "Iraq",                           currencyCode: "IQD", currencySymbol: "ع.د" },
  IL: { countryName: "Israel",                         currencyCode: "ILS", currencySymbol: "₪" },
  JP: { countryName: "Japan",                          currencyCode: "JPY", currencySymbol: "¥" },
  JO: { countryName: "Jordan",                         currencyCode: "JOD", currencySymbol: "JD" },
  KE: { countryName: "Kenya",                          currencyCode: "KES", currencySymbol: "KSh" },
  KW: { countryName: "Kuwait",                         currencyCode: "KWD", currencySymbol: "KD" },
  LB: { countryName: "Lebanon",                        currencyCode: "LBP", currencySymbol: "L£" },
  MY: { countryName: "Malaysia",                       currencyCode: "MYR", currencySymbol: "RM" },
  MV: { countryName: "Maldives",                       currencyCode: "MVR", currencySymbol: "Rf" },
  MX: { countryName: "Mexico",                         currencyCode: "MXN", currencySymbol: "$" },
  MA: { countryName: "Morocco",                        currencyCode: "MAD", currencySymbol: "MAD" },
  MM: { countryName: "Myanmar",                        currencyCode: "MMK", currencySymbol: "K" },
  NP: { countryName: "Nepal",                          currencyCode: "NPR", currencySymbol: "Rs" },
  NZ: { countryName: "New Zealand",                    currencyCode: "NZD", currencySymbol: "NZ$" },
  NG: { countryName: "Nigeria",                        currencyCode: "NGN", currencySymbol: "₦" },
  OM: { countryName: "Oman",                           currencyCode: "OMR", currencySymbol: "OMR" },
  PK: { countryName: "Pakistan",                       currencyCode: "PKR", currencySymbol: "Rs" },
  PH: { countryName: "Philippines",                    currencyCode: "PHP", currencySymbol: "₱" },
  QA: { countryName: "Qatar",                          currencyCode: "QAR", currencySymbol: "QR" },
  SA: { countryName: "Saudi Arabia",                   currencyCode: "SAR", currencySymbol: "﷼" },
  SG: { countryName: "Singapore",                      currencyCode: "SGD", currencySymbol: "S$" },
  ZA: { countryName: "South Africa",                   currencyCode: "ZAR", currencySymbol: "R" },
  KR: { countryName: "South Korea",                    currencyCode: "KRW", currencySymbol: "₩" },
  LK: { countryName: "Sri Lanka",                      currencyCode: "LKR", currencySymbol: "Rs" },
  TW: { countryName: "Taiwan",                         currencyCode: "TWD", currencySymbol: "NT$" },
  TZ: { countryName: "Tanzania",                       currencyCode: "TZS", currencySymbol: "TSh" },
  TH: { countryName: "Thailand",                       currencyCode: "THB", currencySymbol: "฿" },
  TN: { countryName: "Tunisia",                        currencyCode: "TND", currencySymbol: "DT" },
  UG: { countryName: "Uganda",                         currencyCode: "UGX", currencySymbol: "USh" },
  AE: { countryName: "United Arab Emirates",           currencyCode: "AED", currencySymbol: "د.إ" },
  US: { countryName: "United States",                  currencyCode: "USD", currencySymbol: "$" },
  VN: { countryName: "Vietnam",                        currencyCode: "VND", currencySymbol: "₫" },
  YE: { countryName: "Yemen",                          currencyCode: "YER", currencySymbol: "﷼" },
  ZM: { countryName: "Zambia",                         currencyCode: "ZMW", currencySymbol: "ZK" },
};

/**
 * Get country info by ISO country code.
 * Falls back to India (IN) if the code is not found.
 */
export const getCountryInfo = (isoCode) => {
  const code = (isoCode || "IN").toUpperCase();
  const info = COUNTRY_CURRENCY_MAP[code];
  if (info) {
    return { countryCode: code, ...info };
  }
  return { countryCode: "IN", ...COUNTRY_CURRENCY_MAP["IN"] };
};

/**
 * Sorted array of all countries for admin dropdown and frontend lists.
 * Sorted alphabetically by country name.
 */
export const COUNTRIES_LIST = Object.entries(COUNTRY_CURRENCY_MAP)
  .map(([code, info]) => ({ countryCode: code, ...info }))
  .sort((a, b) => a.countryName.localeCompare(b.countryName));
