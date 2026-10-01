import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const LS_KEY = "adminNotifSeenAt";
const POLL_INTERVAL = 60_000; // 60 seconds

function getSeenAt() {
  try {
    const seenAt = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    // Older versions stored the customers timestamp under `customers`
    if (seenAt.customers && !seenAt.customersSeenAt) {
      seenAt.customersSeenAt = seenAt.customers;
    }
    delete seenAt.customers;
    return seenAt;
  } catch {
    return {};
  }
}

function saveSeenAt(seenAt) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(seenAt));
  } catch {}
}

// Maps sidebar paths to their count key in the API response
export const NOTIF_PATH_MAP = {
  "/admin/orders": "newOrders",
  "/admin/customers": "newCustomers",
  "/admin/leads": "newLeads",
  "/admin/reviews": "pendingReviews",
  "/admin/support": "newFormSubmissions",
};

// Maps sidebar paths to the "last opened" timestamp sent to the API. Each
// badge only counts items created after the admin last opened that page.
const SEEN_PARAM_MAP = {
  "/admin/orders": "ordersSeenAt",
  "/admin/customers": "customersSeenAt",
  "/admin/leads": "leadsSeenAt",
  "/admin/reviews": "reviewsSeenAt",
  "/admin/support": "formSubmissionsSeenAt",
};

export function useAdminNotifications() {
  const [counts, setCounts] = useState({
    newOrders: 0,
    newCustomers: 0,
    newLeads: 0,
    pendingReviews: 0,
    newFormSubmissions: 0,
  });

  const timerRef = useRef(null);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const seenAt = getSeenAt();
    const params = {};
    for (const param of Object.values(SEEN_PARAM_MAP)) {
      if (seenAt[param]) params[param] = seenAt[param];
    }

    try {
      const { data } = await axios.get(API_ENDPOINTS.ADMIN_NOTIFICATION_COUNTS, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setCounts(data);
    } catch {
      // silently ignore — don't break the layout on network errors
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    timerRef.current = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchCounts]);

  // Call this when admin navigates to a notifiable page so the badge clears
  const markSeen = useCallback(
    (path) => {
      const key = NOTIF_PATH_MAP[path];
      if (!key) return;

      const seenAt = getSeenAt();
      seenAt[SEEN_PARAM_MAP[path]] = Date.now();
      saveSeenAt(seenAt);

      setCounts((prev) => ({ ...prev, [key]: 0 }));
    },
    []
  );

  return { counts, markSeen };
}
