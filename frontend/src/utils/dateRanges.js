// Period options shared by the admin Dashboard and Reports pages. Keys match
// the backend's ?range= values (backend/src/utils/dateRange.js).
export const RANGE_OPTIONS = [
  { key: "today", label: "Today", compareLabel: "vs yesterday, same time" },
  { key: "yesterday", label: "Yesterday", compareLabel: "vs day before" },
  { key: "7d", label: "Last 7 Days", compareLabel: "vs previous 7 days" },
  { key: "30d", label: "Last 30 Days", compareLabel: "vs previous 30 days" },
  { key: "90d", label: "Last 90 Days", compareLabel: "vs previous 90 days" },
  { key: "this_month", label: "This Month", compareLabel: "vs same days last month" },
  { key: "last_month", label: "Last Month", compareLabel: "vs the month before" },
  { key: "this_year", label: "This Year", compareLabel: "vs same period last year" },
  { key: "all", label: "All Time", compareLabel: "" },
];

// The saved range for a page (per-browser), or the default.
export const getStoredRange = (storageKey, fallback = "30d") => {
  try {
    const stored = localStorage.getItem(storageKey);
    return RANGE_OPTIONS.some((o) => o.key === stored) ? stored : fallback;
  } catch {
    return fallback;
  }
};

export const saveRange = (storageKey, range) => {
  try {
    localStorage.setItem(storageKey, range);
  } catch {
    // Storage unavailable; the choice just won't be remembered.
  }
};

export const getRangeOption = (key) => RANGE_OPTIONS.find((o) => o.key === key) || RANGE_OPTIONS[3];

// Change vs the previous period: null when there is nothing to compare.
export const getChange = (current, previous) => {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) {
    return current === 0 ? { label: "0%", direction: 0 } : { label: "New", direction: 1 };
  }
  const pct = ((current - previous) / previous) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return {
    label: `${rounded > 0 ? "+" : ""}${rounded.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
    direction: Math.sign(rounded),
  };
};
