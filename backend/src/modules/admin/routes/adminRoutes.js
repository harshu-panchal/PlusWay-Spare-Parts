import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { authAdmin, getAdminProfile, getDashboardStats, getReportStats, getWalletStats, getBulkUploadHistory } from "../controllers/adminController.js";
import {
  getCustomers,
  getCustomerById,
  createCustomer as createCustomerAdmin,
  updateCustomer as updateCustomerAdmin,
  deleteCustomer as deleteCustomerAdmin,
} from "../controllers/customerController.js";
import {
  getReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import {
  getTickets,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  bulkCreateProducts,
  downloadProductTemplate,
  deleteBulkProducts,
  exportProductsBackup,
  bulkUpdatePrices,
  downloadPriceUpdateTemplate,
} from "../controllers/productController.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import {
  getModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  deleteBulkModels,
  bulkCreateModels,
  downloadModelTemplate,
} from "../controllers/modelController.js";
import {
  getOrders,
  getOrderById as getAdminOrderById,
  updateOrderToDelivered,
  updateOrderStatus,
  getOrderInvoice,
} from "../controllers/orderController.js";
import { protect, admin } from "../../../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for Excel bulk upload files
const excelUpload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") {
      cb(null, true);
    } else {
      cb(new Error("Only Excel/CSV files (.xlsx, .xls, .csv) are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});


const router = express.Router();

router.post("/login", authAdmin);
router.get("/profile", protect, admin, getAdminProfile);
router.get("/dashboard-stats", protect, admin, getDashboardStats);
router.get("/reports-stats", protect, admin, getReportStats);
router.get("/wallet-stats", protect, admin, getWalletStats);
router.get("/bulk-upload-history", protect, admin, getBulkUploadHistory);

// Order routes
router.route("/orders").get(protect, admin, getOrders);
router.route("/orders/:id").get(protect, admin, getAdminOrderById);
router.route("/orders/:id/deliver").put(protect, admin, updateOrderToDelivered);
router.route("/orders/:id/status").put(protect, admin, updateOrderStatus);
router.route("/orders/:id/invoice").get(protect, admin, getOrderInvoice);

// Brand routes
router
  .route("/brands")
  .get(protect, admin, getBrands)
  .post(protect, admin, createBrand);
router
  .route("/brands/:id")
  .put(protect, admin, updateBrand)
  .delete(protect, admin, deleteBrand);

// Product routes
// IMPORTANT: bulk-upload and bulk-template must come BEFORE /:id to avoid route collision
router.post("/products/bulk-upload", protect, admin, excelUpload.single("file"), bulkCreateProducts);
router.get("/products/bulk-template", protect, admin, downloadProductTemplate);
router.delete("/products/bulk", protect, admin, deleteBulkProducts);
router.get("/products/export", protect, admin, exportProductsBackup);
router.post("/products/bulk-update-price", protect, admin, excelUpload.single("file"), bulkUpdatePrices);
router.get("/products/bulk-price-template", protect, admin, downloadPriceUpdateTemplate);
router
  .route("/products")
  .get(protect, admin, getProducts)
  .post(protect, admin, createProduct);
router
  .route("/products/:id")
  .get(protect, admin, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/products/:id/stock").put(protect, admin, updateProductStock);

// Customer routes
router
  .route("/customers")
  .get(protect, admin, getCustomers)
  .post(protect, admin, createCustomerAdmin);

router
  .route("/customers/:id")
  .get(protect, admin, getCustomerById)
  .put(protect, admin, updateCustomerAdmin)
  .delete(protect, admin, deleteCustomerAdmin);

// Review routes
router.route("/reviews").get(protect, admin, getReviews);
router
  .route("/reviews/:id")
  .put(protect, admin, updateReview)
  .delete(protect, admin, deleteReview);

// Ticket routes
router.route("/tickets").get(protect, admin, getTickets);
router
  .route("/tickets/:id")
  .put(protect, admin, updateTicket)
  .delete(protect, admin, deleteTicket);

// Category routes
router
  .route("/categories")
  .get(protect, admin, getCategories)
  .post(protect, admin, createCategory);
router
  .route("/categories/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// Model routes
// IMPORTANT: bulk-upload, bulk-template, and bulk delete must come BEFORE /:id to avoid route collision
router.post("/models/bulk-upload", protect, admin, excelUpload.single("file"), bulkCreateModels);
router.get("/models/bulk-template", protect, admin, downloadModelTemplate);
router.delete("/models/bulk", protect, admin, deleteBulkModels);
router
  .route("/models")
  .get(protect, admin, getModels)
  .post(protect, admin, createModel);
router
  .route("/models/:id")
  .get(protect, admin, getModelById)
  .put(protect, admin, updateModel)
  .delete(protect, admin, deleteModel);

export default router;
