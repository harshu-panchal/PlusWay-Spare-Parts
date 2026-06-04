// Models store `released` as a freeform string. Different code paths produced
// different shapes over time:
//   - The Admin → Models edit form historically stored "February 2023" (en-US "MMMM yyyy").
//   - The bulk-upload Excel template now accepts dd/mm/yyyy and stores e.g. "15/02/2023".
//   - Legacy / freeform entries may be anything.
//
// This helper normalizes ANY recognized shape into "Month YYYY" (e.g. "May 2025")
// for display. If the input is unparseable, it is returned as-is so we never
// accidentally hide existing freeform data.

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fromYearMonth = (year, monthIdx) => {
  if (!Number.isFinite(year) || year < 1900 || year > 2999) return null;
  if (!Number.isFinite(monthIdx) || monthIdx < 0 || monthIdx > 11) return null;
  return `${MONTH_NAMES[monthIdx]} ${year}`;
};

export const formatReleasedDate = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") {
    // Date instance or anything castable.
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return fromYearMonth(d.getFullYear(), d.getMonth()) || "";
    }
    return String(value);
  }

  const s = value.trim();
  if (!s) return "";

  // 1) dd/mm/yyyy (or with '-' / '.' separators, 2- or 4-digit year)
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, , mo, y] = m;
    if (y.length === 2) y = (Number(y) >= 70 ? "19" : "20") + y;
    return fromYearMonth(Number(y), Number(mo) - 1) || s;
  }

  // 2) ISO-ish "YYYY-MM" or "YYYY-MM-DD"
  m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m) {
    return fromYearMonth(Number(m[1]), Number(m[2]) - 1) || s;
  }

  // 3) "MM/YYYY" (no day)
  m = s.match(/^(\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    return fromYearMonth(Number(m[2]), Number(m[1]) - 1) || s;
  }

  // 4) Already "Month YYYY" or "Mon YYYY" — pass through (handles both "February 2023"
  //    and "Feb 2023"; we normalize to the full month name for consistency).
  m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const monIdx = MONTH_NAMES.findIndex(
      (n) => n.toLowerCase().startsWith(m[1].toLowerCase()),
    );
    if (monIdx !== -1) return fromYearMonth(Number(m[2]), monIdx) || s;
  }

  // 5) Last resort — let the JS Date parser try.
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return fromYearMonth(d.getFullYear(), d.getMonth()) || s;
  }

  return s; // Unrecognized freeform — leave alone.
};

// Helper for the admin form: convert a stored `released` string into the
// "YYYY-MM" shape the <input type="month"> expects. Returns "" if unparseable.
export const releasedToYearMonth = (value) => {
  if (!value || typeof value !== "string") return "";
  const s = value.trim();
  if (!s) return "";

  let year, monthIdx;

  // dd/mm/yyyy (with '/' '-' '.' separators)
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (m) {
    let [, , mo, y] = m;
    if (y.length === 2) y = (Number(y) >= 70 ? "19" : "20") + y;
    year = Number(y);
    monthIdx = Number(mo) - 1;
  } else if ((m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/))) {
    year = Number(m[1]);
    monthIdx = Number(m[2]) - 1;
  } else if ((m = s.match(/^(\d{1,2})[\/\-.](\d{4})$/))) {
    year = Number(m[2]);
    monthIdx = Number(m[1]) - 1;
  } else if ((m = s.match(/^([A-Za-z]+)\s+(\d{4})$/))) {
    const idx = MONTH_NAMES.findIndex((n) =>
      n.toLowerCase().startsWith(m[1].toLowerCase()),
    );
    if (idx !== -1) {
      year = Number(m[2]);
      monthIdx = idx;
    }
  } else {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      year = d.getFullYear();
      monthIdx = d.getMonth();
    }
  }

  if (!Number.isFinite(year) || !Number.isFinite(monthIdx)) return "";
  if (monthIdx < 0 || monthIdx > 11) return "";
  return `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
};

export default formatReleasedDate;
