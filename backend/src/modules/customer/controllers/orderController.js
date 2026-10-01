import mongoose from 'mongoose';
import Order from '../../../models/Order.js';
import Product from '../../../models/Product.js';
import Cart from '../../../models/Cart.js';
import Setting from '../../../models/Setting.js';
import crypto from 'crypto';
import generateInvoice, { invoiceToken, publicBaseUrl } from '../../../utils/generateInvoice.js';
import { getDealForProduct } from '../../../services/offerPricing.js';

// Allowed gap between the total the customer saw and the server's total
const TOTAL_TOLERANCE = 0.5;

// @desc    Create new order
// @route   POST /api/customer/orders
// @access  Private
//
// Prices are computed here from the database (product price, minus any live
// offer deal) plus shipping and tax from settings; the prices the browser
// sends are ignored. If the browser's total differs (e.g. a deal ended while
// the customer was on checkout) the order is refused with 409 so they can
// review the new total.
export const addOrderItems = async (req, res) => {
  const { orderItems: requestedItems, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  // Merge duplicate lines and validate quantities
  const qtyById = new Map();
  const imageById = new Map();
  for (const item of requestedItems) {
    const id = String(item?.product ?? '');
    const qty = Math.floor(Number(item?.qty));
    if (!mongoose.isValidObjectId(id) || !(qty >= 1)) {
      res.status(400).json({ message: 'Invalid order item' });
      return;
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
      res.status(400).json({ message: 'An item in your cart is no longer available. Please review your cart.' });
      return;
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
    res.status(409).json({
      message: 'Prices in your cart have changed. Please review the updated total and try again.',
      code: 'PRICE_CHANGED',
      totalPrice,
    });
    return;
  }

  const order = new Order({
    orderItems,
    customer: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // 1. Decrement Stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = product.countInStock - item.qty;
      await product.save();
    }
  }

  // 2. Clear Cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(201).json(createdOrder);
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
export const updateOrderToPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
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
