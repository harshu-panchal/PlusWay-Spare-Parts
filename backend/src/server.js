import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import customerRoutes from "./modules/customer/routes/customerRoutes.js";
import adminRoutes from "./modules/admin/routes/adminRoutes.js";
import bannerRoutes from "./modules/admin/routes/bannerRoutes.js";
import uploadRoutes from "./modules/upload/routes/uploadRoutes.js";
import configRoutes from "./modules/customer/routes/configRoutes.js";
import homeSectionRoutes from "./modules/admin/routes/homeSectionRoutes.js";
import customerHomeSectionRoutes from "./modules/customer/routes/homeSectionRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import fcmTokenRoutes from "./routes/fcmTokenRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";

import Product from "./models/Product.js";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Connect to Database & Run One-Shot Migration
connectDB().then(async () => {
  try {
    const result = await Product.updateMany(
      { $or: [{ deviceType: "Mobile" }, { deviceType: ["Mobile"] }, { deviceType: { $exists: false } }] },
      { $set: { deviceType: ["Spare Parts"] } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Updated ${result.modifiedCount} existing products to deviceType: ["Spare Parts"]`);
    }
  } catch (err) {
    console.error("[Migration Error]:", err.message);
  }
});

const app = express();

// Trust proxy for express-rate-limit when behind Nginx/load balancer
app.set('trust proxy', 1);

// Compression middleware (place early to compress all responses)
app.use(compression());

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        const error = new Error("Not allowed by CORS");
        error.statusCode = 403;
        callback(error);
      }
    },
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Static files with caching
const staticOptions = {
  maxAge: "1d",
  etag: false,
  lastModified: true,
};
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), staticOptions),
);

// Set Cache-Control headers for API responses (optional, per route can be more specific)
app.use((req, res, next) => {
  // Don't cache API responses that are dynamic
  if (req.path.startsWith("/api/")) {
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
  }
  next();
});

// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/home-sections", homeSectionRoutes);
app.use("/api/customer/home-sections", customerHomeSectionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/config", configRoutes);
app.use("/api/v1/translate", translationRoutes);
app.use("/api/fcm-tokens", fcmTokenRoutes);
app.use("/api/settings", settingRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("PlusWay Spare Parts API is running");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
