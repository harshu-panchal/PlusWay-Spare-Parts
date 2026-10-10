import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../../../models/Order.js";
import { finalizeCheckout, loadOwnCheckout } from "./orderController.js";

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not found in environment variables");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create the Razorpay order for a checkout (no store order exists yet)
// @route   POST /api/customer/checkout/:id/razorpay
// @access  Private
export const createRazorpayCheckout = async (req, res) => {
  try {
    const checkout = await loadOwnCheckout(req, res);
    if (!checkout) return;

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(checkout.totalPrice * 100),
      currency: "INR",
      receipt: checkout._id.toString(),
    });

    checkout.razorpayOrderId = razorpayOrder.id;
    await checkout.save();

    res.json({ ...razorpayOrder, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Razorpay Create Checkout Error:", error);
    const errorMsg = error?.error?.description || error?.message || "Unable to create Razorpay order";
    res.status(500).json({ message: errorMsg });
  }
};

// @desc    Verify the Razorpay payment and create the order
// @route   POST /api/customer/checkout/:id/razorpay/verify
// @access  Private
export const verifyRazorpayCheckout = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const checkout = await loadOwnCheckout(req, res);
    if (!checkout) return;

    // The payment must be for the Razorpay order created for THIS checkout
    if (!checkout.razorpayOrderId || checkout.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Payment does not match this checkout" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const order = await finalizeCheckout(checkout, {
      paymentMethod: "razorpay",
      paymentResult: {
        id: razorpay_payment_id,
        status: "completed",
        update_time: String(Date.now()),
        email_address: req.user.email,
      },
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("Razorpay Verify Checkout Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

// @desc    Create Razorpay Order (for an order left unpaid before payment-first checkout)
// @route   POST /api/customer/orders/:id/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to pay this order" });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Razorpay expects amount in paise (multiply by 100)
    // Assuming totalPrice is in INR
    const options = {
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: order._id.toString(),
    };

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      ...razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID, // Send key_id to frontend
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    const errorMsg = error?.error?.description || error?.message || "Unable to create Razorpay order";
    res.status(500).json({ message: errorMsg });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/customer/orders/:id/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to pay this order" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      order.isPaid = true;
      order.paidAt = Date.now();
      // Record the gateway that actually took the payment, even if the
      // order was created for a different one.
      order.paymentMethod = "razorpay";
      order.paymentResult = {
        id: razorpay_payment_id,
        status: "completed",
        update_time: Date.now(),
        email_address: req.user.email,
        razorpay_order_id,
        razorpay_signature
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    console.error("Razorpay Verify Payment Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
