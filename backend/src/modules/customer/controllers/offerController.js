import asyncHandler from "../../../middleware/asyncHandler.js";
import Offer from "../../../models/Offer.js";
import Product from "../../../models/Product.js";
import { attachDeals, liveOfferQuery, offerPercentFor } from "../../../services/offerPricing.js";

// Fields a ProductCard needs
const CARD_FIELDS =
  "name slug images price mrp countInStock colorVariants countryPricing status brand";

const PREVIEW_PRODUCTS = 8;
const MAX_OFFER_PRODUCTS = 500;

const offerStatus = (offer, now = new Date()) => {
  if (!offer.isActive) return "inactive";
  if (offer.startDate && offer.startDate > now) return "upcoming";
  if (offer.endDate && offer.endDate <= now) return "ended";
  return "live";
};

// Public fields of an offer, plus the highest discount it gives
const publicOffer = (offer) => {
  const percents = (offer.products || []).map((item) => offerPercentFor(offer, item));
  return {
    _id: offer._id,
    title: offer.title,
    slug: offer.slug,
    subtitle: offer.subtitle,
    description: offer.description,
    badgeText: offer.badgeText,
    bannerImage: offer.bannerImage,
    accentColor: offer.accentColor,
    discountMode: offer.discountMode,
    maxDiscountPercent: percents.length ? Math.max(...percents) : 0,
    startDate: offer.startDate,
    endDate: offer.endDate,
    productCount: offer.products?.length || 0,
  };
};

// Storefront-visible products of an offer, with deals, biggest discount first
const loadOfferProducts = async (offer, limit) => {
  const ids = (offer.products || []).map((item) => item.product);
  const products = await Product.find({ _id: { $in: ids }, status: { $ne: "Draft" } })
    .select(CARD_FIELDS)
    .populate("brand", "name isActive")
    .limit(MAX_OFFER_PRODUCTS);
  const visible = products.filter((p) => p.brand?.isActive !== false);
  const withDeals = await attachDeals(visible);
  withDeals.sort((a, b) => (b.deal?.percent || 0) - (a.deal?.percent || 0));
  return limit ? withDeals.slice(0, limit) : withDeals;
};

// @desc    Live offers (with a few products each for previews)
// @route   GET /api/customer/offers?home=1
// @access  Public
export const getLiveOffers = asyncHandler(async (req, res) => {
  const query = liveOfferQuery();
  if (req.query.home === "1") query.showOnHome = true;

  const offers = await Offer.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();
  const result = await Promise.all(
    offers.map(async (offer) => ({
      ...publicOffer(offer),
      previewProducts: await loadOfferProducts(offer, PREVIEW_PRODUCTS),
    })),
  );
  res.json(result);
});

// @desc    One offer with all its products. Ended/upcoming offers are
//          returned without products so the page can say so.
// @route   GET /api/customer/offers/:slug
// @access  Public
export const getOfferBySlug = asyncHandler(async (req, res) => {
  const offer = await Offer.findOne({ slug: req.params.slug }).lean();
  if (!offer || !offer.isActive) {
    res.status(404);
    throw new Error("Offer not found");
  }
  const status = offerStatus(offer);
  res.json({
    ...publicOffer(offer),
    status,
    products: status === "live" ? await loadOfferProducts(offer) : [],
  });
});
