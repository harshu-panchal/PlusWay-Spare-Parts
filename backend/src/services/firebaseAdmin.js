import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", error);
  }
}

if (!serviceAccount) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? join(__dirname, "../../", process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : join(__dirname, "../config/firebase-service-account.json");
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/**
 * Send push notification to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} payload - Notification payload { title, body, data }
 */
export const sendPushNotification = async (tokens, payload) => {
  try {
    if (!tokens || tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent: ${response.successCount} messages`);
    console.log(`Failed: ${response.failureCount} messages`);

    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    // Don't throw for dummy credentials during setup
    return { successCount: 0, failureCount: tokens.length, error: error.message };
  }
};

export default admin;
