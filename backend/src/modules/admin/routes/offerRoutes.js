import express from "express";
import {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController.js";
import { protect, admin } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getOffers).post(protect, admin, createOffer);

router
  .route("/:id")
  .get(protect, admin, getOfferById)
  .put(protect, admin, updateOffer)
  .delete(protect, admin, deleteOffer);

export default router;
