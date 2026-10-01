import Offer from "../models/Offer.js";

// Live-offer lookups are cached briefly: product listings call this on every
// request and the offers collection changes rarely. Admin writes clear it.
const CACHE_TTL_MS = 30 * 1000;
let cache = { at: 0, deals: null, offers: null };

export const clearOfferCache = () => {
  cache = { at: 0, deals: null, offers: null };
};

// Query for offers that are switched on and inside their time window
export const liveOfferQuery = (now = new Date()) => ({
  isActive: true,
  startDate: { $lte: now },
  $or: [{ endDate: null }, { endDate: { $gt: now } }],
});

// Discount % an offer gives one of its products
export const offerPercentFor = (offer, item) =>
  offer.discountMode === "perProduct"
    ? Number(item.discountPercent) || 0
    : Number(offer.discountPercent) || 0;

// Deal price in whole rupees
export const applyDealPercent = (price, percent) =>
  Math.max(0, Math.round((Number(price) || 0) * (1 - percent / 100)));

const loadLiveOffers = async () => {
  if (cache.offers && Date.now() - cache.at < CACHE_TTL_MS) return cache;

  const offers = await Offer.find(liveOfferQuery())
    .select("title slug discountMode discountPercent products endDate")
    .lean();

  // productId -> best deal across all live offers (highest % wins)
  const deals = new Map();
  for (const offer of offers) {
    for (const item of offer.products || []) {
      const percent = offerPercentFor(offer, item);
      if (percent <= 0) continue;
      const key = String(item.product);
      const existing = deals.get(key);
      if (!existing || percent > existing.percent) {
        deals.set(key, {
          offerId: String(offer._id),
          title: offer.title,
          slug: offer.slug,
          percent,
          endsAt: offer.endDate || null,
        });
      }
    }
  }

  cache = { at: Date.now(), deals, offers };
  return cache;
};

// Deal for a product id, or null. `price` is the deal price of the base
// (INR) product price; the storefront applies `percent` to variant and
// country prices itself.
export const getDealForProduct = async (product) => {
  if (!product?._id) return null;
  const { deals } = await loadLiveOffers();
  const deal = deals.get(String(product._id));
  if (!deal) return null;
  return { ...deal, price: applyDealPercent(product.price, deal.percent) };
};

/**
 * Attach `deal` to each product. Accepts mongoose docs or plain objects and
 * returns plain objects (a mongoose doc would drop the extra field when
 * serialised).
 */
export const attachDeals = async (products) => {
  const list = Array.isArray(products) ? products : [];
  if (list.length === 0) return [];
  const { deals } = await loadLiveOffers();
  return list.map((p) => {
    const plain = typeof p?.toObject === "function" ? p.toObject() : p;
    if (!plain?._id) return plain;
    const deal = deals.get(String(plain._id));
    return {
      ...plain,
      deal: deal ? { ...deal, price: applyDealPercent(plain.price, deal.percent) } : null,
    };
  });
};

export const attachDeal = async (product) => (await attachDeals([product]))[0];
