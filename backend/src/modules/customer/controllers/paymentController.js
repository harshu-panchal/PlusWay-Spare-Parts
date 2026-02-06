import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../../../models/Order.js";

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

// @desc    Create Razorpay Order
// @route   POST /api/customer/orders/:id/razorpay
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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
    res.status(500).json({ message: "Unable to create Razorpay order" });
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

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      order.isPaid = true;
      order.paidAt = Date.now();
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
