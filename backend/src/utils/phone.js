import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
} from "libphonenumber-js/mobile";

const DEFAULT_COUNTRY = "IN";

/**
 * Validate a customer mobile number against the selected country and
 * return the key it is stored under.
 *
 * - `mobile` is the digits the user typed (national number), or a full
 *   E.164 string starting with "+".
 * - `countryCode` is the ISO-2 code picked in the country dropdown.
 *
 * Indian numbers keep the legacy 10-digit storage format so existing
 * accounts and OTP records keep matching. Every other country is stored
 * in E.164 (e.g. "+14165551234") so numbers from different countries can
 * never collide.
 *
 * Returns { valid, mobile, e164, country } — `mobile` is the storage key.
 */
export const normalizeCustomerMobile = (mobile, countryCode) => {
  const raw = String(mobile || "").trim();
  const iso = String(countryCode || DEFAULT_COUNTRY).toUpperCase();

  let expectedCallingCode;
  try {
    expectedCallingCode = getCountryCallingCode(iso);
  } catch {
    return { valid: false };
  }

  const phone = raw.startsWith("+")
    ? parsePhoneNumberFromString(raw)
    : parsePhoneNumberFromString(raw.replace(/\D/g, ""), iso);

  // `libphonenumber-js/mobile` only treats mobile-capable numbers as valid,
  // and the calling-code check rejects e.g. an Indian number entered with
  // Canada (+1) selected.
  if (
    !phone ||
    !phone.isValid() ||
    phone.countryCallingCode !== expectedCallingCode
  ) {
    return { valid: false };
  }

  const isIndia = phone.countryCallingCode === "91";
  return {
    valid: true,
    mobile: isIndia ? phone.nationalNumber : phone.number,
    e164: phone.number,
    country: phone.country || iso,
  };
};
