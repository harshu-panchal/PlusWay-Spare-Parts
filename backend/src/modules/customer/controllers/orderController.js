import mongoose from 'mongoose';
import Order from '../../../models/Order.js';
import PendingCheckout, { CHECKOUT_TTL_MS } from '../../../models/PendingCheckout.js';
import Product from '../../../models/Product.js';
import Cart from '../../../models/Cart.js';
import Setting from '../../../models/Setting.js';
import crypto from 'crypto';
import generateInvoice, { invoiceToken, publicBaseUrl } from '../../../utils/generateInvoice.js';
import { getDealForProduct } from '../../../services/offerPricing.js';

// Allowed gap between the total the customer saw and the server's total
const TOTAL_TOLERANCE = 0.5;

// Prices are computed here from the database (product price, minus any live
// offer deal) plus shipping and tax from settings; the prices the browser
// sends are ignored. If the browser's total differs (e.g. a deal ended while
// the customer was on checkout) it is refused with 409 so they can review the
// new total. Returns { error: { status, body } } or { draft }.
const buildOrderDraft = async (req) => {
  const { orderItems: requestedItems, shippingAddress, paymentMethod } = req.body;
  const fail = (status, body) => ({ error: { status, body } });

  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    return fail(400, { message: 'No order items' });
  }

  // Merge duplicate lines and validate quantities
  const qtyById = new Map();
  const imageById = new Map();
  for (const item of requestedItems) {
    const id = String(item?.product ?? '');
    const qty = Math.floor(Number(item?.qty));
    if (!mongoose.isValidObjectId(id) || !(qty >= 1)) {
      return fail(400, { message: 'Invalid order item' });
    }
    qtyById.set(id, (qtyById.get(id) || 0) + qty);
    if (item.image && !imageById.has(id)) imageById.set(id, item.image);
  }

  const products = await Product.find({
    _id: { $in: [...qtyById.keys()] },
    status: { $ne: 'Draft' },
  });
  const productById = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  for (const [id, qty] of qtyById) {
    const product = productById.get(id);
    if (!product) {
      return fail(400, { message: 'An item in your cart is no longer available. Please review your cart.' });
    }
    const deal = await getDealForProduct(product);
    orderItems.push({
      name: product.name,
      qty,
      image: imageById.get(id) || product.images?.[0] || 'sample.jpg',
      price: deal ? deal.price : product.price,
      originalPrice: product.price,
      offer: deal
        ? { offerId: deal.offerId, title: deal.title, discountPercent: deal.percent }
        : undefined,
      product: product._id,
    });
  }

  // Same rules as the Checkout page
  const settings = await Setting.findOne().lean();
  const shippingConfig = settings?.shipping || {};
  const standardShippingFee = Number(shippingConfig.standardShippingFee) || 0;
  const freeShippingThreshold = Number(shippingConfig.freeShippingThreshold) || 0;
  const taxPercentage = Number(shippingConfig.taxPercentage) || 0;

  const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice =
    freeShippingThreshold > 0 && itemsPrice >= freeShippingThreshold ? 0 : standardShippingFee;
  const taxPrice = Math.round(itemsPrice * (taxPercentage / 100) * 100) / 100;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const clientTotal = Number(req.body.totalPrice);
  if (Number.isFinite(clientTotal) && Math.abs(clientTotal - totalPrice) > TOTAL_TOLERANCE) {
    return fail(409, {
      message: 'Prices in your cart have changed. Please review the updated total and try again.',
      code: 'PRICE_CHANGED',
      totalPrice,
    });
  }

  return {
    draft: { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice },
  };
};

// @desc    Price the cart and start a checkout. NO order is created here: the
//          order only exists once a payment succeeds (see finalizeCheckout), so
//          a cancelled or failed payment leaves no order, stock or cart change.
// @route   POST /api/customer/checkout
// @access  Private
export const createCheckout = async (req, res) => {
  if (!['paypal', 'razorpay'].includes(req.body.paymentMethod)) {
    res.status(400).json({ message: 'Unsupported payment method' });
    return;
  }

  const { draft, error } = await buildOrderDraft(req);
  if (error) {
    res.status(error.status).json(error.body);
    return;
  }

  const checkout = await PendingCheckout.create({
    ...draft,
    customer: req.user._id,
    expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS),
  });

  res.status(201).json({
    _id: checkout._id,
    totalPrice: checkout.totalPrice,
    shippingAddress: checkout.shippingAddress,
  });
};

// Loads a checkout the logged-in customer owns, or answers 404/401 itself
// and returns null.
export const loadOwnCheckout = async (req, res) => {
  const checkout = mongoose.isValidObjectId(req.params.id)
    ? await PendingCheckout.findById(req.params.id)
    : null;
  if (!checkout) {
    res.status(404).json({ message: 'Checkout not found or expired. Please start again.' });
    return null;
  }
  if (checkout.customer.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: 'Not authorized for this checkout' });
    return null;
  }
  return checkout;
};

// Turns a paid checkout into an Order: creates it (already paid), takes the
// stock and empties the cart. Safe to call twice for the same checkout; the
// second call returns the order made by the first.
export const finalizeCheckout = async (checkout, { paymentMethod, paymentResult }) => {
  // Claim the checkout so two simultaneous confirmations can't both create an order
  const orderId = new mongoose.Types.ObjectId();
  const claimed = await PendingCheckout.findOneAndUpdate(
    { _id: checkout._id, order: { $exists: false } },
    { $set: { order: orderId } },
    { new: true },
  );
  if (!claimed) {
    const existing = await PendingCheckout.findById(checkout._id);
    return Order.findById(existing.order);
  }

  const order = new Order({
    _id: orderId,
    orderItems: checkout.orderItems,
    customer: checkout.customer,
    shippingAddress: checkout.shippingAddress,
    paymentMethod,
    itemsPrice: checkout.itemsPrice,
    taxPrice: checkout.taxPrice,
    shippingPrice: checkout.shippingPrice,
    totalPrice: checkout.totalPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentResult,
  });

  let createdOrder;
  try {
    createdOrder = await order.save();
  } catch (err) {
    // Release the claim so the customer's retry can create the order
    await PendingCheckout.updateOne({ _id: checkout._id }, { $unset: { order: 1 } });
    throw err;
  }

  // 1. Decrement Stock
  for (const item of checkout.orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = product.countInStock - item.qty;
      await product.save();
    }
  }

  // 2. Clear Cart
  const cart = await Cart.findOne({ user: checkout.customer });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  return createdOrder;
};

// @desc    Confirm a PayPal payment and create the order
// @route   POST /api/customer/checkout/:id/paypal/complete
// @access  Private
export const completePaypalCheckout = async (req, res) => {
  const checkout = await loadOwnCheckout(req, res);
  if (!checkout) return;

  const details = req.body || {};
  if (!details.id || details.status !== 'COMPLETED') {
    res.status(400).json({ message: 'PayPal payment was not completed' });
    return;
  }

  const order = await finalizeCheckout(checkout, {
    paymentMethod: 'paypal',
    paymentResult: {
      id: details.id,
      status: details.status,
      update_time: details.update_time,
      email_address: details.payer?.email_address || details.email_address,
    },
  });
  if (!order) {
    res.status(409).json({ message: 'Your order is still being created. Please check My Orders in a moment.' });
    return;
  }
  res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/customer/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'customer',
    'name email mobile'
  );

  if (order) {
    // Check if the order belongs to the logged-in customer
    if (order.customer._id.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to view this order' });
      return;
    }
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Download invoice (shipping label + tax invoice) for own order
// @route   GET /api/customer/orders/:id/invoice
// @access  Private
export const getOrderInvoice = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  const order = await Order.findById(req.params.id).populate('customer', 'name email mobile');

  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return;
  }
  if (order.customer._id.toString() !== req.user._id.toString()) {
    res.status(401).json({ message: 'Not authorized to view this order' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
  await generateInvoice(order, res, publicBaseUrl(req));
};

// @desc    Update order to paid
// @route   PUT /api/customer/orders/:id/pay
// @access  Private
//
// Only for orders created before payment-first checkout that were left
// unpaid; new orders are created already paid.
export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.customer.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized to pay this order' });
      return;
    }
    order.isPaid = true;
    order.paidAt = Date.now();
    // This route is only used by the PayPal flow; record the gateway that
    // actually took the payment.
    order.paymentMethod = 'paypal';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/customer/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Order.countDocuments({ customer: req.user._id });
  const orders = await Order.find({ customer: req.user._id })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Download an invoice via the signed link in its QR code
// @route   GET /api/customer/invoice/:id/:token
// @access  Public (token-gated)
export const getInvoiceByToken = async (req, res) => {
  const { id, token } = req.params;
  const expected = mongoose.isValidObjectId(id) ? invoiceToken(id) : '';
  const ok =
    expected.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  const order = ok ? await Order.findById(id).populate('customer', 'name email mobile') : null;
  if (!order) {
    res.status(404).json({ message: 'Invoice not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
  await generateInvoice(order, res, publicBaseUrl(req));
};
