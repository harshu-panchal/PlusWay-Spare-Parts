import { messaging, getToken, onMessage } from "../firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Register service worker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("✅ Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      throw error;
    }
  } else {
    throw new Error("Service Workers are not supported");
  }
}

// Request notification permission
async function requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("✅ Notification permission granted");
      return true;
    } else {
      console.log("❌ Notification permission denied");
      return false;
    }
  }
  return false;
}

// Get FCM token
async function getFCMToken() {
  try {
    const registration = await registerServiceWorker();
    // Use the registration to get the token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token);
      return token;
    } else {
      console.log("❌ No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("❌ Error getting FCM token:", error);
    // Silent fail for dummy credentials
    return null;
  }
}

// Register FCM token with backend
async function registerFCMToken(forceUpdate = false) {
  try {
    // Check if already registered in this session
    const savedToken = localStorage.getItem("fcm_token_web");
    if (savedToken && !forceUpdate) {
      console.log("FCM token already registered");
      return savedToken;
    }

    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      // Don't throw, just exit
      return null;
    }

    // Get token
    const token = await getFCMToken();
    if (!token) {
      return null;
    }

    // Save to backend
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const adminToken = localStorage.getItem("adminToken");
    const authToken = userInfo?.token || adminToken;

    if (!authToken) {
      console.log("No auth token found, cannot register FCM token");
      return null;
    }

    const response = await fetch(`${API_URL}/api/fcm-tokens/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmtoken: token,
        platform: "web",
      }),
    });

    if (response.ok) {
      localStorage.setItem("fcm_token_web", token);
      console.log("✅ FCM token registered with backend");
      return token;
    } else {
      console.error("Failed to register token with backend");
      return null;
    }
  } catch (error) {
    console.error("❌ Error registering FCM token:", error);
    return null;
  }
}

// Remove FCM token from backend
async function removeFCMToken() {
  try {
    const token = localStorage.getItem("fcm_token_web");
    if (!token) return;

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const adminToken = localStorage.getItem("adminToken");
    const authToken = userInfo?.token || adminToken;

    if (!authToken) return;

    await fetch(`${API_URL}/api/fcm-tokens/remove`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fcmtoken: token,
        platform: "web",
      }),
    });

    localStorage.removeItem("fcm_token_web");
    console.log("✅ FCM token removed from backend");
  } catch (error) {
    console.error("❌ Error removing FCM token:", error);
  }
}

// Setup foreground notification handler
function setupForegroundNotificationHandler(handler) {
  onMessage(messaging, (payload) => {
    console.log("📬 Foreground message received:", payload);

    // Show notification using native Notification API
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon || "/favicon.png",
        data: payload.data,
      });
    }

    // Call custom handler if provided
    if (handler) {
      handler(payload);
    }
  });
}

// Initialize push notifications
async function initializePushNotifications() {
  try {
    if ("serviceWorker" in navigator) {
      await registerServiceWorker();
      // Token registration usually happens after login
    }
  } catch (error) {
    console.error("Error initializing push notifications:", error);
  }
}

export {
  initializePushNotifications,
  registerFCMToken,
  removeFCMToken,
  setupForegroundNotificationHandler,
  requestNotificationPermission,
};
