// Display helpers for offers / deals on the storefront.

const pad = (n) => String(n).padStart(2, "0");

// Time left until `endsAt`, e.g. "2d 04:12:09" or "04:12:09"; null when no
// end date, "" when already ended.
export const formatTimeLeft = (endsAt, now = Date.now()) => {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - now;
  if (!(ms > 0)) return "";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
};

// Headline for an offer: admin badge text, else "Up to N% off"
export const offerHeadline = (offer) =>
  offer.badgeText ||
  (offer.maxDiscountPercent > 0
    ? `${offer.discountMode === "uniform" ? "" : "Up to "}${offer.maxDiscountPercent}% off`
    : "Special deal");

// Gradient from the offer's accent colour, used when there's no cover image
export const offerGradient = (offer) => {
  const color = offer.accentColor || "#ff6b00";
  return `linear-gradient(135deg, ${color} 0%, #111827 140%)`;
};
