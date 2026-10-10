import mongoose from "mongoose";

// A checkout that has been priced but not paid yet. The Order itself is only
// created once the payment gateway confirms payment, so a cancelled or failed
// payment leaves no order, no stock change and an untouched cart. The prices
// computed here are the ones the customer is charged, even if a deal changes
// while the payment window is open.
const pendingCheckoutSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Customer" },
    // Same shapes as Order, copied verbatim into the Order on success
    orderItems: { type: Array, required: true },
    shippingAddress: { type: Object, required: true },
    paymentMethod: { type: String, required: true }, // "paypal" | "razorpay"
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    // Set once the Razorpay order exists; the verify step matches on it
    razorpayOrderId: { type: String },
    // The Order created from this checkout (makes completing it idempotent)
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Abandoned checkouts delete themselves
pendingCheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CHECKOUT_TTL_MS = 24 * 60 * 60 * 1000;

const PendingCheckout = mongoose.model("PendingCheckout", pendingCheckoutSchema);

export default PendingCheckout;
