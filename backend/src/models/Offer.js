import mongoose from "mongoose";

// An offer / deal: a curated set of products sold at a discount for a time
// window. The discount is either one percentage for every product
// ("uniform") or set per product ("perProduct").
//
// Prices are applied by services/offerPricing.js: every product sent to the
// storefront gets a `deal` when a live offer contains it, and order totals
// are recomputed server-side with the same rules.
export const DISCOUNT_MODES = ["uniform", "perProduct"];
export const MIN_DISCOUNT_PERCENT = 1;
export const MAX_DISCOUNT_PERCENT = 90;

const offerProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Used when discountMode is "perProduct"
    discountPercent: {
      type: Number,
      min: 0,
      max: MAX_DISCOUNT_PERCENT,
      default: 0,
    },
  },
  { _id: false },
);

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    // Short label on cards, e.g. "Up to 40% off"
    badgeText: { type: String, default: "", trim: true },
    // Cover image for the offer card and the offer page hero
    bannerImage: { type: String, default: "" },
    // Accent colour for the offer card/hero when there is no image
    accentColor: { type: String, default: "#ff6b00" },

    discountMode: {
      type: String,
      enum: DISCOUNT_MODES,
      default: "uniform",
    },
    // Used when discountMode is "uniform"
    discountPercent: {
      type: Number,
      min: 0,
      max: MAX_DISCOUNT_PERCENT,
      default: 10,
    },
    products: [offerProductSchema],

    startDate: { type: Date, default: Date.now },
    // No end date = runs until switched off
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    // Show a deals strip for this offer on the home page
    showOnHome: { type: Boolean, default: false },
    // Lower comes first on the offers page / home page
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
offerSchema.index({ "products.product": 1 });

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
