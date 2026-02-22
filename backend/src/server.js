import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from 'url';
import customerRoutes from "./modules/customer/routes/customerRoutes.js";
import adminRoutes from "./modules/admin/routes/adminRoutes.js";
import bannerRoutes from "./modules/admin/routes/bannerRoutes.js";
import uploadRoutes from "./modules/upload/routes/uploadRoutes.js";
import configRoutes from "./modules/customer/routes/configRoutes.js";
import homeSectionRoutes from "./modules/admin/routes/homeSectionRoutes.js";
import customerHomeSectionRoutes from "./modules/customer/routes/homeSectionRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to Database
connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/home-sections", homeSectionRoutes);
app.use("/api/customer/home-sections", customerHomeSectionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/config", configRoutes);
app.use("/api/v1/translate", translationRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("PlusWay Spare Parts API is running");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
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
