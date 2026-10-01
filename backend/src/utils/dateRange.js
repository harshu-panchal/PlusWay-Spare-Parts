// Date ranges for admin stats, computed in IST (UTC+5:30, no DST).
const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const DASHBOARD_RANGES = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "90d",
  "this_month",
  "last_month",
  "this_year",
  "all",
];

// IST calendar parts of an instant
const istParts = (ms) => {
  const d = new Date(ms + IST_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate() };
};

// The instant of IST midnight for a calendar date (month may overflow)
const istMidnight = (y, m, day) => Date.UTC(y, m, day) - IST_OFFSET_MS;

/**
 * Resolve a range key to { key, start, end, prevStart, prevEnd } (Dates).
 * The previous period has the same length, ending where this one starts
 * (or, for "this month/year", the same elapsed span of the previous
 * month/year). "all" has no previous period.
 */
export const resolveDashboardRange = (key, now = Date.now()) => {
  const rangeKey = DASHBOARD_RANGES.includes(key) ? key : "30d";
  const { y, m, day } = istParts(now);
  const todayStart = istMidnight(y, m, day);

  let start;
  let end = now;
  let prevStart = null;
  let prevEnd = null;

  const rolling = (days) => {
    start = todayStart - (days - 1) * DAY_MS; // includes today
    prevStart = start - days * DAY_MS;
    prevEnd = end - days * DAY_MS;
  };

  switch (rangeKey) {
    case "today":
      start = todayStart;
      prevStart = start - DAY_MS;
      prevEnd = end - DAY_MS; // yesterday up to the same time of day
      break;
    case "yesterday":
      start = todayStart - DAY_MS;
      end = todayStart;
      prevStart = start - DAY_MS;
      prevEnd = start;
      break;
    case "7d":
      rolling(7);
      break;
    case "90d":
      rolling(90);
      break;
    case "this_month":
      start = istMidnight(y, m, 1);
      prevStart = istMidnight(y, m - 1, 1);
      prevEnd = Math.min(prevStart + (end - start), start);
      break;
    case "last_month":
      start = istMidnight(y, m - 1, 1);
      end = istMidnight(y, m, 1);
      prevStart = istMidnight(y, m - 2, 1);
      prevEnd = start;
      break;
    case "this_year":
      start = istMidnight(y, 0, 1);
      prevStart = istMidnight(y - 1, 0, 1);
      prevEnd = Math.min(prevStart + (end - start), start);
      break;
    case "all":
      start = 0;
      break;
    case "30d":
    default:
      rolling(30);
  }

  return {
    key: rangeKey,
    start: new Date(start),
    end: new Date(end),
    prevStart: prevStart === null ? null : new Date(prevStart),
    prevEnd: prevEnd === null ? null : new Date(prevEnd),
  };
};

// Custom range from "YYYY-MM-DD" dates, both days included, in IST.
// Returns { start, end } (end exclusive) or { error }.
export const resolveIstDayRange = (from, to) => {
  const parse = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const [, y, m, d] = match.map(Number);
    const ms = istMidnight(y, m - 1, d);
    // Reject impossible dates like 2026-02-31 (Date.UTC would roll them over)
    const check = istParts(ms);
    return check.y === y && check.m === m - 1 && check.day === d ? ms : null;
  };
  const start = parse(from);
  const toStart = parse(to);
  if (start === null || toStart === null) return { error: "Dates must be valid and in YYYY-MM-DD format" };
  if (toStart < start) return { error: "The 'from' date must be on or before the 'to' date" };
  return { start: new Date(start), end: new Date(toStart + DAY_MS) };
};
