import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";
import {
  registerCustomer,
  authCustomer,
  updateCustomerProfile,
} from "../controllers/customerController.js";
import {
  getProducts,
  getProductById,
} from "../controllers/productController.js";
import {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getMyOrders,
} from "../controllers/orderController.js";
import { getCategories } from "../../admin/controllers/categoryController.js";
import { getBrands } from "../../admin/controllers/brandController.js";
import { getModels } from "../../admin/controllers/modelController.js";
import { getActiveBanners } from "../../admin/controllers/bannerController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", registerCustomer);
router.post("/login", authCustomer);

// Profile routes (Protected)
router.put("/profile", protect, updateCustomerProfile);

// Product & Content routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.get("/models", getModels);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/banners", getActiveBanners);

// Cart routes (Protected)
router.route("/cart").get(protect, getCart).post(protect, addToCart);
router.route("/cart/:itemId")
  .put(protect, updateCartItem)
  .delete(protect, removeCartItem);

// Order routes
router.route("/orders").post(protect, addOrderItems);
router.route("/orders/myorders").get(protect, getMyOrders);
router.route("/orders/:id").get(protect, getOrderById);
router.route("/orders/:id/pay").put(protect, updateOrderToPaid);

export default router;
