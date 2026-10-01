import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const LS_KEY = "adminNotifSeenAt";
const POLL_INTERVAL = 60_000; // 60 seconds

function getSeenAt() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
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
    if (seenAt.customers) params.customersSeenAt = seenAt.customers;

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

      // For customers we track a timestamp; for others the backend uses status so
      // just re-fetch (the admin visiting the page is implied to handle items there)
      if (path === "/admin/customers") {
        const seenAt = getSeenAt();
        seenAt.customers = Date.now();
        saveSeenAt(seenAt);
      }

      // Optimistically zero out this badge, then re-fetch for accuracy
      setCounts((prev) => ({ ...prev, [key]: 0 }));
      fetchCounts();
    },
    [fetchCounts]
  );

  return { counts, markSeen };
}
