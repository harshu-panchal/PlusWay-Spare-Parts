import mongoose from "mongoose";
import asyncHandler from "../../../middleware/asyncHandler.js";
import Offer, {
  DISCOUNT_MODES,
  MIN_DISCOUNT_PERCENT,
  MAX_DISCOUNT_PERCENT,
} from "../../../models/Offer.js";
import Product from "../../../models/Product.js";
import { clearOfferCache } from "../../../services/offerPricing.js";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "offer";

// A slug not used by another offer: "diwali-sale", "diwali-sale-2", ...
const uniqueSlug = async (base, excludeId) => {
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await Offer.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    });
    if (!clash) return slug;
    slug = `${base}-${n}`;
  }
};

const isValidPercent = (value) =>
  Number.isFinite(value) &&
  value >= MIN_DISCOUNT_PERCENT &&
  value <= MAX_DISCOUNT_PERCENT;

const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

// Validate and normalise the admin form. Throws a 400 on bad input.
const buildOfferFields = async (body, res, existing) => {
  const fail = (message) => {
    res.status(400);
    throw new Error(message);
  };

  const title = String(body.title ?? existing?.title ?? "").trim();
  if (!title) fail("Offer title is required");

  const discountMode = body.discountMode ?? existing?.discountMode ?? "uniform";
  if (!DISCOUNT_MODES.includes(discountMode)) fail("Invalid discount mode");

  const discountPercent = Number(body.discountPercent ?? existing?.discountPercent ?? 0);
  if (discountMode === "uniform" && !isValidPercent(discountPercent)) {
    fail(`Discount must be between ${MIN_DISCOUNT_PERCENT}% and ${MAX_DISCOUNT_PERCENT}%`);
  }

  // Products: dedupe, check ids exist, validate per-product %
  let products = existing?.products ?? [];
  if (Array.isArray(body.products)) {
    const seen = new Set();
    products = [];
    for (const item of body.products) {
      const id = String(item?.product?._id ?? item?.product ?? "");
      if (!mongoose.isValidObjectId(id) || seen.has(id)) continue;
      seen.add(id);
      products.push({ product: id, discountPercent: Number(item.discountPercent) || 0 });
    }
    const found = await Product.countDocuments({ _id: { $in: [...seen] } });
    if (found !== seen.size) fail("Some selected products no longer exist");
  }
  if (discountMode === "perProduct" && products.some((p) => !isValidPercent(Number(p.discountPercent)))) {
    fail(`Every product needs a discount between ${MIN_DISCOUNT_PERCENT}% and ${MAX_DISCOUNT_PERCENT}%`);
  }

  const startDate = parseDate(body.startDate ?? existing?.startDate) ?? new Date();
  const endDate = parseDate(body.endDate !== undefined ? body.endDate : existing?.endDate);
  if (startDate === undefined || endDate === undefined) fail("Invalid date");
  if (endDate && endDate <= startDate) fail("End date must be after the start date");

  const requestedSlug = body.slug ? slugify(body.slug) : existing?.slug || slugify(title);

  return {
    title,
    slug: await uniqueSlug(requestedSlug, existing?._id),
    subtitle: String(body.subtitle ?? existing?.subtitle ?? "").trim(),
    description: String(body.description ?? existing?.description ?? "").trim(),
    badgeText: String(body.badgeText ?? existing?.badgeText ?? "").trim(),
    bannerImage: String(body.bannerImage ?? existing?.bannerImage ?? ""),
    accentColor: String(body.accentColor ?? existing?.accentColor ?? "#ff6b00"),
    discountMode,
    discountPercent: discountMode === "uniform" ? discountPercent : existing?.discountPercent ?? 0,
    products,
    startDate,
    endDate,
    isActive: body.isActive ?? existing?.isActive ?? true,
    showOnHome: body.showOnHome ?? existing?.showOnHome ?? false,
    sortOrder: Number(body.sortOrder ?? existing?.sortOrder ?? 0) || 0,
  };
};

// @desc    List offers (without product details)
// @route   GET /api/admin/offers
// @access  Private/Admin
export const getOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json(
    offers.map((offer) => ({
      ...offer,
      productCount: offer.products?.length || 0,
      products: undefined,
    })),
  );
});

// @desc    Get one offer with its products
// @route   GET /api/admin/offers/:id
// @access  Private/Admin
export const getOfferById = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate({
    path: "products.product",
    select: "name code price mrp images countInStock status",
  });
  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }
  // Drop entries whose product was deleted
  const plain = offer.toObject();
  plain.products = plain.products.filter((item) => item.product);
  res.json(plain);
});

// @desc    Create an offer
// @route   POST /api/admin/offers
// @access  Private/Admin
export const createOffer = asyncHandler(async (req, res) => {
  const fields = await buildOfferFields(req.body, res);
  const offer = await Offer.create(fields);
  clearOfferCache();
  res.status(201).json(offer);
});

// @desc    Update an offer
// @route   PUT /api/admin/offers/:id
// @access  Private/Admin
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }
  const fields = await buildOfferFields(req.body, res, offer.toObject());
  offer.set(fields);
  await offer.save();
  clearOfferCache();
  res.json(offer);
});

// @desc    Delete an offer
// @route   DELETE /api/admin/offers/:id
// @access  Private/Admin
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    res.status(404);
    throw new Error("Offer not found");
  }
  await Offer.deleteOne({ _id: offer._id });
  clearOfferCache();
  res.json({ message: "Offer removed" });
});
