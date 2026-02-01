import express from "express";
import {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
} from "../controllers/bannerController.js";
import { protect, admin } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .get(protect, admin, getAllBanners)
    .post(protect, admin, createBanner);

router
    .route("/:id")
    .put(protect, admin, updateBanner)
    .delete(protect, admin, deleteBanner);

export default router;
