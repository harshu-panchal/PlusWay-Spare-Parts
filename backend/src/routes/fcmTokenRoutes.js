import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Customer from "../models/Customer.js";
import Admin from "../models/Admin.js";

const router = express.Router();

// @desc    Save FCM token
// @route   POST /api/fcm-tokens/save
// @access  Private
router.post("/save", protect, async (req, res) => {
  try {
    const { fcmtoken, platform = "web" } = req.body;
    const user = req.user;
    const role = user.role === "admin" ? "admin" : "customer";
    const Model = role === "admin" ? Admin : Customer;

    const dbUser = await Model.findById(user._id);

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (platform === "web") {
      if (!dbUser.fcmTokens) dbUser.fcmTokens = [];
      if (!dbUser.fcmTokens.includes(fcmtoken)) {
        dbUser.fcmTokens.push(fcmtoken);
        // Limit to 10 tokens
        if (dbUser.fcmTokens.length > 10) {
          dbUser.fcmTokens = dbUser.fcmTokens.slice(-10);
        }
      }
    } else if (platform === "app" || platform === "mobile") {
      if (!dbUser.fcmTokenMobile) dbUser.fcmTokenMobile = [];
      if (!dbUser.fcmTokenMobile.includes(fcmtoken)) {
        dbUser.fcmTokenMobile.push(fcmtoken);
        if (dbUser.fcmTokenMobile.length > 10) {
          dbUser.fcmTokenMobile = dbUser.fcmTokenMobile.slice(-10);
        }
      }
    }

    await dbUser.save();

    res.json({ success: true, message: "FCM token saved" });
  } catch (error) {
    console.error("Error saving FCM token:", error);
    res.status(500).json({ message: "Failed to save token" });
  }
});

// Remove FCM token
// @route   DELETE /api/fcm-tokens/remove
// @access  Private
router.delete("/remove", protect, async (req, res) => {
  try {
    const { fcmtoken, platform = "web" } = req.body;
    const user = req.user;
    const role = user.role === "admin" ? "admin" : "customer";
    const Model = role === "admin" ? Admin : Customer;

    const dbUser = await Model.findById(user._id);

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (platform === "web" && dbUser.fcmTokens) {
      dbUser.fcmTokens = dbUser.fcmTokens.filter((t) => t !== fcmtoken);
    } else if ((platform === "app" || platform === "mobile") && dbUser.fcmTokenMobile) {
      dbUser.fcmTokenMobile = dbUser.fcmTokenMobile.filter((t) => t !== fcmtoken);
    }

    await dbUser.save();
    res.json({ success: true, message: "FCM token removed" });
  } catch (error) {
    console.error("Error removing FCM token:", error);
    res.status(500).json({ message: "Failed to remove token" });
  }
});

export default router;
