// Curated country list for the mobile-number country-code picker.
// Sorted with India first (primary market), then alphabetical.
//
// `length` is the expected mobile NSN length (the local number, excluding
// the country code). It's a single number for countries with a fixed
// length, or a [min, max] tuple where it varies. Used as a soft hint —
// the form still allows submission, the length just drives the input's
// maxLength and the "X / N digits" helper text.
const COUNTRY_CODES = [
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳", length: 10 },
  { code: "AE", dial: "+971", name: "United Arab Emirates", flag: "🇦🇪", length: 9 },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺", length: 9 },
  { code: "BD", dial: "+880", name: "Bangladesh", flag: "🇧🇩", length: 10 },
  { code: "BH", dial: "+973", name: "Bahrain", flag: "🇧🇭", length: 8 },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦", length: 10 },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳", length: 11 },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪", length: [10, 11] },
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬", length: 10 },
  { code: "ES", dial: "+34", name: "Spain", flag: "🇪🇸", length: 9 },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷", length: 9 },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "HK", dial: "+852", name: "Hong Kong", flag: "🇭🇰", length: 8 },
  { code: "ID", dial: "+62", name: "Indonesia", flag: "🇮🇩", length: [9, 11] },
  { code: "IT", dial: "+39", name: "Italy", flag: "🇮🇹", length: 10 },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵", length: 10 },
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪", length: 9 },
  { code: "KW", dial: "+965", name: "Kuwait", flag: "🇰🇼", length: 8 },
  { code: "LK", dial: "+94", name: "Sri Lanka", flag: "🇱🇰", length: 9 },
  { code: "MY", dial: "+60", name: "Malaysia", flag: "🇲🇾", length: [9, 10] },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬", length: 10 },
  { code: "NL", dial: "+31", name: "Netherlands", flag: "🇳🇱", length: 9 },
  { code: "NP", dial: "+977", name: "Nepal", flag: "🇳🇵", length: 10 },
  { code: "NZ", dial: "+64", name: "New Zealand", flag: "🇳🇿", length: [8, 10] },
  { code: "OM", dial: "+968", name: "Oman", flag: "🇴🇲", length: 8 },
  { code: "PH", dial: "+63", name: "Philippines", flag: "🇵🇭", length: 10 },
  { code: "PK", dial: "+92", name: "Pakistan", flag: "🇵🇰", length: 10 },
  { code: "QA", dial: "+974", name: "Qatar", flag: "🇶🇦", length: 8 },
  { code: "RU", dial: "+7", name: "Russia", flag: "🇷🇺", length: 10 },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦", length: 9 },
  { code: "SG", dial: "+65", name: "Singapore", flag: "🇸🇬", length: 8 },
  { code: "TH", dial: "+66", name: "Thailand", flag: "🇹🇭", length: 9 },
  { code: "TR", dial: "+90", name: "Turkey", flag: "🇹🇷", length: 10 },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸", length: 10 },
  { code: "VN", dial: "+84", name: "Vietnam", flag: "🇻🇳", length: 9 },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦", length: 9 },
];

export default COUNTRY_CODES;

export const DEFAULT_COUNTRY = COUNTRY_CODES[0]; // India
export const STORAGE_KEY = "selectedCountryCode";

// Resolve a stored country code (ISO) back to a full entry. Falls back to
// India if nothing valid is stored.
export const getCountryByIso = (iso) => {
  if (!iso) return DEFAULT_COUNTRY;
  return COUNTRY_CODES.find((c) => c.code === iso) || DEFAULT_COUNTRY;
};

// Convenience: the maxLength value for a country, picking the upper bound
// when a range is given.
export const getMaxLength = (country) => {
  if (!country) return 15;
  return Array.isArray(country.length) ? country.length[1] : country.length;
};

// Convenience: a human "X / N digits" or "X / N-M digits" label.
export const getLengthLabel = (country, currentLength = 0) => {
  if (!country) return "";
  if (Array.isArray(country.length)) {
    return `${currentLength} / ${country.length[0]}–${country.length[1]} digits`;
  }
  return `${currentLength} / ${country.length} digits`;
};

// True when the entered digits-only mobile number satisfies the country's
// expected length (single value or [min, max] range).
export const isMobileValidForCountry = (mobile, country) => {
  if (!country) return String(mobile || "").length === 10;
  const len = String(mobile || "").length;
  if (Array.isArray(country.length)) {
    return len >= country.length[0] && len <= country.length[1];
  }
  return len === country.length;
};
