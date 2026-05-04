import { sendPushNotification } from "../services/firebaseAdmin.js";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";

/**
 * Send notification to a specific user (Customer or Admin)
 * @param {string} userId - User ID
 * @param {string} userType - 'customer' or 'admin'
 * @param {object} payload - { title, body, data }
 * @param {boolean} includeMobile - Whether to include mobile tokens
 */
export const sendNotificationToUser = async (userId, userType, payload, includeMobile = true) => {
  try {
    let user;
    if (userType === "customer") {
      user = await Customer.findById(userId);
    } else if (userType === "admin") {
      user = await Admin.findById(userId);
    }

    if (!user) {
      console.log(`${userType} not found: ${userId}`);
      return;
    }

    // Collect tokens
    let tokens = [];
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      tokens = [...tokens, ...user.fcmTokens];
    }
    if (includeMobile && user.fcmTokenMobile && user.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...user.fcmTokenMobile];
    }

    // Remove duplicates and empty tokens
    const uniqueTokens = [...new Set(tokens)].filter((t) => t);

    if (uniqueTokens.length === 0) {
      console.log(`No FCM tokens found for ${userType}: ${userId}`);
      return;
    }

    // Send notification
    await sendPushNotification(uniqueTokens, payload);
  } catch (error) {
    console.error("Error sending notification helper:", error);
  }
};

/**
 * Send notification to multiple users
 * @param {string[]} userIds - Array of User IDs
 * @param {string} userType - 'customer' or 'admin'
 * @param {object} payload - { title, body, data }
 */
export const sendNotificationToMultipleUsers = async (userIds, userType, payload) => {
  try {
    const Model = userType === "customer" ? Customer : Admin;
    const users = await Model.find({ _id: { $in: userIds } });

    let allTokens = [];
    users.forEach((user) => {
      if (user.fcmTokens) allTokens = [...allTokens, ...user.fcmTokens];
      if (user.fcmTokenMobile) allTokens = [...allTokens, ...user.fcmTokenMobile];
    });

    const uniqueTokens = [...new Set(allTokens)].filter((t) => t);

    if (uniqueTokens.length === 0) return;

    await sendPushNotification(uniqueTokens, payload);
  } catch (error) {
    console.error("Error sending bulk notification:", error);
  }
};
