import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  Metadata,
} from "libphonenumber-js/mobile";

// Country list for the mobile-number country-code picker, generated from
// libphonenumber's metadata so every country/region it can validate is
// selectable (~245). Sorted with India first (primary market), then
// alphabetical by name.
//
// `length` is the expected mobile NSN length (the local number, excluding
// the country code). It's a single number for countries with a fixed
// length, or a [min, max] tuple where it varies. It drives the input's
// maxLength and when the "doesn't match country" hint appears.
const PRIMARY_COUNTRY = "IN";

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

// "IN" -> "🇮🇳" (pair of regional-indicator symbols).
const toFlag = (iso) =>
  String.fromCodePoint(...[...iso].map((ch) => 0x1f1a5 + ch.charCodeAt(0)));

const getMobileLength = (metadata, iso) => {
  metadata.selectNumberingPlan(iso);
  const lengths = metadata.numberingPlan.type("MOBILE")?.possibleLengths();
  if (!lengths || lengths.length === 0) return null;
  const min = Math.min(...lengths);
  const max = Math.max(...lengths);
  return min === max ? min : [min, max];
};

const buildCountryCodes = () => {
  const metadata = new Metadata();
  const list = [];
  for (const iso of getCountries()) {
    const length = getMobileLength(metadata, iso);
    // Skip regions with no mobile numbering plan (can't receive an OTP).
    if (!length) continue;
    let name = iso;
    try {
      name = regionNames?.of(iso) || iso;
    } catch {
      // Unknown to this browser's Intl data; fall back to the ISO code.
    }
    list.push({
      code: iso,
      dial: `+${getCountryCallingCode(iso)}`,
      name,
      flag: toFlag(iso),
      length,
    });
  }
  list.sort((a, b) => {
    if (a.code === PRIMARY_COUNTRY) return -1;
    if (b.code === PRIMARY_COUNTRY) return 1;
    return a.name.localeCompare(b.name);
  });
  return list;
};

const COUNTRY_CODES = buildCountryCodes();

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

// The fewest digits a number for this country can have, used to decide
// when to show a "doesn't match country" hint without nagging mid-typing.
export const getMinLength = (country) => {
  if (!country) return 10;
  return Array.isArray(country.length) ? country.length[0] : country.length;
};

// Convenience: a human "X / N digits" or "X / N-M digits" label.
export const getLengthLabel = (country, currentLength = 0) => {
  if (!country) return "";
  if (Array.isArray(country.length)) {
    return `${currentLength} / ${country.length[0]}–${country.length[1]} digits`;
  }
  return `${currentLength} / ${country.length} digits`;
};

// True when the entered digits-only mobile number is a real mobile number
// for the selected country. Uses libphonenumber's per-country numbering
// plans, so e.g. an Indian number is rejected when Canada (+1) is picked
// even though both are 10 digits. The backend runs the same check.
export const isMobileValidForCountry = (mobile, country) => {
  const iso = country?.code || DEFAULT_COUNTRY.code;
  const phone = parsePhoneNumberFromString(String(mobile || ""), iso);
  return Boolean(
    phone &&
      phone.isValid() &&
      `+${phone.countryCallingCode}` === (country?.dial || DEFAULT_COUNTRY.dial),
  );
};
