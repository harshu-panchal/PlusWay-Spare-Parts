import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import {
  registerCustomer,
  authCustomer,
  updateCustomerProfile,
  deleteCustomerAccount,
} from "../controllers/customerController.js";
import { sendOtp, verifyOtp } from "../controllers/authController.js";
import { otpLimiter } from "../../../middleware/rateLimiter.js";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";
import {
  getProducts,
  getProductById,
  createProductReview,
} from "../controllers/productController.js";
import { getMyReviews } from "../controllers/reviewController.js";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
} from "../controllers/orderController.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { getCategories } from "../../admin/controllers/categoryController.js";
import { getBrands } from "../../admin/controllers/brandController.js";
import { getModels } from "../../admin/controllers/modelController.js";
import { getActiveBanners } from "../../admin/controllers/bannerController.js";
import { globalSearch } from "../controllers/searchController.js";
import { createLead } from "../controllers/leadController.js";
import { createFormSubmission } from "../controllers/formSubmissionController.js";
import { protect } from "../../../middleware/authMiddleware.js";
import { formSubmissionLimiter } from "../../../middleware/rateLimiter.js";
import { getCountry, getExchangeRatesHandler } from "../controllers/geoController.js";

const router = express.Router();

// Lead routes (Public)
router.post("/leads", createLead);

// Form submissions — Contact / Support / Career / Replacement (Public)
router.post("/form-submissions", formSubmissionLimiter, createFormSubmission);

// Auth routes
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerCustomer);
router.post("/login", authCustomer);

// Profile routes (Protected)
router.put("/profile", protect, updateCustomerProfile);
router.delete("/profile", protect, deleteCustomerAccount);
router.delete("/account", protect, deleteCustomerAccount);

// Address routes (Protected)
router.route("/addresses").get(protect, getAddresses).post(protect, addAddress);

router
  .route("/addresses/:id")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.put("/addresses/:id/default", protect, setDefaultAddress);

// Geo / Exchange Rate routes (Public)
router.get("/geo/country", getCountry);
router.get("/exchange-rates", getExchangeRatesHandler);

// Product & Content routes
router.get("/search", globalSearch);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.route("/products/:id/reviews").post(protect, createProductReview);
router.get("/models", getModels);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/banners", getActiveBanners);

// Review routes
router.get("/reviews", protect, getMyReviews);

// Cart routes (Protected)
router
  .route("/cart")
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, clearCart);
router
  .route("/cart/:itemId")
  .put(protect, updateCartItem)
  .delete(protect, removeCartItem);

// Order routes
router.route("/orders").post(protect, addOrderItems);
router.route("/orders/myorders").get(protect, getMyOrders);
router.route("/orders/:id").get(protect, getOrderById);
router.route("/orders/:id/pay").put(protect, updateOrderToPaid);

// Razorpay routes
router.post("/orders/:id/razorpay", protect, createRazorpayOrder);
router.post("/orders/:id/razorpay/verify", protect, verifyRazorpayPayment);

export default router;
