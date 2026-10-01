import Admin from "../../../models/Admin.js";
import Order from "../../../models/Order.js";
import Customer from "../../../models/Customer.js";
import Product from "../../../models/Product.js";
import Brand from "../../../models/Brand.js";
import Category from "../../../models/Category.js";
import Model from "../../../models/Model.js";
import BulkUploadHistory from "../../../models/BulkUploadHistory.js";
import Review from "../../../models/Review.js";
import Lead from "../../../models/Lead.js";
import FormSubmission from "../../../models/FormSubmission.js";
import generateToken from "../../../utils/generateToken.js";
import asyncHandler from "../../../middleware/asyncHandler.js";
import { resolveDashboardRange, resolveIstDayRange } from "../../../utils/dateRange.js";

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
export const authAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await admin.matchPassword(password))) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id, "admin"),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);

  if (admin) {
    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } else {
    res.status(404);
    throw new Error("Admin not found");
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Period metrics follow the selected range (?range=today|yesterday|7d|30d|
  // 90d|this_month|last_month|this_year|all) and are compared with the
  // previous period of the same length. Catalog counts are all-time.
  const range = resolveDashboardRange(req.query.range);

  const periodMetrics = async (from, to) => {
    const paidInPeriod = {
      isPaid: true,
      status: { $ne: "Cancelled" },
      paidAt: { $gte: from, $lt: to },
    };
    const [revenueAgg, soldAgg, orders, newCustomers] = await Promise.all([
      // Revenue: paid orders, by payment date
      Order.aggregate([
        { $match: paidInPeriod },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      // Products sold: item quantities in those paid orders
      Order.aggregate([
        { $match: paidInPeriod },
        { $unwind: "$orderItems" },
        { $group: { _id: null, total: { $sum: "$orderItems.qty" } } },
      ]),
      // Orders placed in the period (paid or not)
      Order.countDocuments({ createdAt: { $gte: from, $lt: to } }),
      // Customers who signed up in the period
      Customer.countDocuments({ createdAt: { $gte: from, $lt: to } }),
    ]);
    return {
      revenue: revenueAgg[0]?.total || 0,
      orders,
      newCustomers,
      productsSold: soldAgg[0]?.total || 0,
    };
  };

  // `end` is "now" for open-ended ranges; nudge it so items created this
  // millisecond are included.
  const current = await periodMetrics(range.start, new Date(range.end.getTime() + 1));
  const previous = range.prevStart
    ? await periodMetrics(range.prevStart, range.prevEnd)
    : null;

  // 5. Total Products
  const totalProducts = await Product.countDocuments();

  // 6. Total Categories
  const totalCategories = await Category.countDocuments();

  // 7. Total Brands
  const totalBrands = await Brand.countDocuments();

  // 8. Total Models
  const totalModels = await Model.countDocuments();

  // 9. Recent Orders (limit 5)
  const recentOrders = await Order.find()
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  // 6. Low Stock Alerts (countInStock <= 5)
  const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } })
    .sort({ countInStock: 1 })
    .limit(5);

  res.json({
    range: {
      key: range.key,
      start: range.start,
      end: range.end,
      prevStart: range.prevStart,
      prevEnd: range.prevEnd,
    },
    ...current,
    previous,
    totalProducts,
    totalCategories,
    totalBrands,
    totalModels,
    recentOrders,
    lowStockProducts,
  });
});

// @desc    Get report stats
// @route   GET /api/admin/reports-stats
// @access  Private/Admin
export const getReportStats = asyncHandler(async (req, res) => {
  // Period metrics follow ?range= (same options as the dashboard) and are
  // compared with the previous period of the same length. The monthly sales
  // trend below always covers the last 6 months.
  const range = resolveDashboardRange(req.query.range);
  const rangeEnd = new Date(range.end.getTime() + 1); // include "now"

  const paidBetween = (from, to) => ({
    isPaid: true,
    status: { $ne: "Cancelled" },
    paidAt: { $gte: from, $lt: to },
  });

  const summaryFor = async (from, to) => {
    const [agg, newCustomers] = await Promise.all([
      Order.aggregate([
        { $match: paidBetween(from, to) },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]),
      Customer.countDocuments({ createdAt: { $gte: from, $lt: to } }),
    ]);
    const totalRevenue = agg[0]?.total || 0;
    const paidOrders = agg[0]?.count || 0;
    return {
      totalRevenue,
      paidOrders,
      avgOrderValue: paidOrders > 0 ? totalRevenue / paidOrders : 0,
      newCustomers,
    };
  };

  // Paid order items joined to their product, then to `from` (categories/brands)
  const itemsBy = (from, to, collection, field) => [
    { $match: paidBetween(from, to) },
    { $unwind: "$orderItems" },
    { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $lookup: { from: collection, localField: `product.${field}`, foreignField: "_id", as: "group" } },
    { $unwind: "$group" },
  ];

  const [current, previous, salesByCategory, topBrands] = await Promise.all([
    summaryFor(range.start, rangeEnd),
    range.prevStart ? summaryFor(range.prevStart, range.prevEnd) : null,
    Order.aggregate([
      ...itemsBy(range.start, rangeEnd, "categories", "category"),
      { $group: { _id: "$group.name", sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } } } },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      ...itemsBy(range.start, rangeEnd, "brands", "brand"),
      // Order lines per brand ("popularity")
      { $group: { _id: "$group._id", name: { $first: "$group.name" }, orders: { $sum: 1 } } },
      { $sort: { orders: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalCategorySales = salesByCategory.reduce((acc, curr) => acc + curr.sales, 0);
  const salesByCategoryWithPercentage = salesByCategory.map((cat) => ({
    name: cat._id,
    sales: cat.sales,
    percentage: totalCategorySales > 0 ? Math.round((cat.sales / totalCategorySales) * 100) : 0,
    color: "bg-blue-500",
  }));

  // Brand growth: same brands' order lines in the previous period
  let previousBrandOrders = new Map();
  if (range.prevStart && topBrands.length) {
    const prev = await Order.aggregate([
      ...itemsBy(range.prevStart, range.prevEnd, "brands", "brand"),
      { $match: { "group._id": { $in: topBrands.map((b) => b._id) } } },
      { $group: { _id: "$group._id", orders: { $sum: 1 } } },
    ]);
    previousBrandOrders = new Map(prev.map((b) => [String(b._id), b.orders]));
  }
  const topBrandsFormatted = topBrands.map((brand) => {
    const prevOrders = range.prevStart ? previousBrandOrders.get(String(brand._id)) || 0 : null;
    let growth = null;
    if (prevOrders !== null) {
      growth = prevOrders === 0 ? "New" : `${Math.round(((brand.orders - prevOrders) / prevOrders) * 100)}%`;
      if (/^\d/.test(growth)) growth = `+${growth}`;
    }
    return { name: brand.name, orders: brand.orders, previousOrders: prevOrders, growth };
  });

  // 6. Monthly Sales Trend (Last 6 Months)
  // Monthly sales for the last 6 calendar months (current month included),
  // bucketed by year+month in IST by payment date. Months without sales are
  // filled with zero so the chart always shows 6 months in order.
  const MONTHS = 6;
  const SALES_TZ = "Asia/Kolkata";
  const [curYear, curMonth] = new Intl.DateTimeFormat("en-CA", {
    timeZone: SALES_TZ,
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);
  const monthKeys = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(curYear, curMonth - 1 - i, 1));
    monthKeys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  // Start of the first month in IST (UTC+5:30, no DST)
  const [firstYear, firstMonth] = monthKeys[0].split("-").map(Number);
  const monthsStart = new Date(Date.UTC(firstYear, firstMonth - 1, 1) - 330 * 60 * 1000);

  const monthlyAgg = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: monthsStart },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$paidAt", timezone: SALES_TZ } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
  ]);
  const monthlyByKey = new Map(monthlyAgg.map((m) => [m._id, m]));
  // _id is "YYYY-MM"
  const monthlySales = monthKeys.map((key) => ({
    _id: key,
    revenue: monthlyByKey.get(key)?.revenue || 0,
    orders: monthlyByKey.get(key)?.orders || 0,
  }));

  res.json({
    range: {
      key: range.key,
      start: range.start,
      end: range.end,
      prevStart: range.prevStart,
      prevEnd: range.prevEnd,
    },
    ...current,
    previous,
    salesByCategory: salesByCategoryWithPercentage,
    topBrands: topBrandsFormatted,
    monthlySales
  });
});

// @desc    Get wallet stats and transaction history
// @route   GET /api/admin/wallet-stats
// @access  Private/Admin
export const getWalletStats = asyncHandler(async (req, res) => {
  // 1. Total Earnings (Sum of all paid orders)
  const totalEarningsResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalEarnings = totalEarningsResult[0]?.total || 0;

  // 2. Pending Payments (Unpaid active orders)
  const pendingPaymentsResult = await Order.aggregate([
    { $match: { isPaid: false, status: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const pendingPayments = pendingPaymentsResult[0]?.total || 0;

  // 3. Today's Earning
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayEarningsResult = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: startOfToday } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const todayEarnings = todayEarningsResult[0]?.total || 0;

  // 4. Transaction history is paged separately: GET /api/admin/wallet-transactions

  // 5. Revenue Trend (daily for the last 14 days, today included). Days are
  // bucketed in IST, and days without sales are filled with zero so the
  // chart always shows 14 evenly spaced days.
  const TREND_DAYS = 14;
  const TREND_TZ = "Asia/Kolkata";
  const toTzDay = (date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: TREND_TZ }).format(date); // YYYY-MM-DD
  const trendDays = [];
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    trendDays.push(toTzDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  // Start a day early so the first IST day is fully covered; extra days
  // are dropped when matching against trendDays.
  const trendStart = new Date(Date.now() - TREND_DAYS * 24 * 60 * 60 * 1000);
  const dailyRevenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: trendStart },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt", timezone: TREND_TZ } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
  ]);
  const revenueByDay = new Map(dailyRevenue.map((d) => [d._id, d]));
  const revenueTrend = trendDays.map((day) => ({
    _id: day,
    revenue: revenueByDay.get(day)?.revenue || 0,
    orders: revenueByDay.get(day)?.orders || 0,
  }));

  res.json({
    summary: {
      totalEarnings,
      pendingPayments,
      todayEarnings,
      balance: totalEarnings, // For now balance is same as earnings
    },
    revenueTrend,
  });
});

const WALLET_PAGE_SIZES = [10, 25, 50, 100];
const WALLET_EXPORT_LIMIT = 10000;

// @desc    Paid-order transactions for the wallet, newest first
// @route   GET /api/admin/wallet-transactions?page=1&pageSize=10
//          ?all=1 returns everything (up to WALLET_EXPORT_LIMIT) for export
//          Optional period (by payment date, IST):
//            ?range=30d (same keys as the dashboard), or
//            ?from=2026-09-01&to=2026-09-30 (both days included)
// @access  Private/Admin
export const getWalletTransactions = asyncHandler(async (req, res) => {
  const filter = { isPaid: true };

  let period = null;
  if (req.query.from || req.query.to) {
    const custom = resolveIstDayRange(req.query.from, req.query.to);
    if (custom.error) {
      res.status(400);
      throw new Error(custom.error);
    }
    period = custom;
  } else if (req.query.range && req.query.range !== "all") {
    const preset = resolveDashboardRange(req.query.range);
    period = { start: preset.start, end: new Date(preset.end.getTime() + 1) };
  }
  if (period) filter.paidAt = { $gte: period.start, $lt: period.end };
  const exportAll = req.query.all === "1";
  const pageSize = WALLET_PAGE_SIZES.includes(Number(req.query.pageSize))
    ? Number(req.query.pageSize)
    : WALLET_PAGE_SIZES[0];

  const [total, amountAgg] = await Promise.all([
    Order.countDocuments(filter),
    Order.aggregate([{ $match: filter }, { $group: { _id: null, sum: { $sum: "$totalPrice" } } }]),
  ]);
  const totalAmount = amountAgg[0]?.sum || 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = exportAll ? 1 : Math.min(Math.max(Math.floor(Number(req.query.page)) || 1, 1), pages);

  // _id breaks ties so rows never repeat or vanish between pages
  let query = Order.find(filter)
    .select("customer totalPrice paymentMethod paidAt createdAt")
    .populate("customer", "name")
    .sort({ paidAt: -1, _id: -1 });
  query = exportAll
    ? query.limit(WALLET_EXPORT_LIMIT)
    : query.skip((page - 1) * pageSize).limit(pageSize);
  const orders = await query.lean();

  res.json({
    transactions: orders.map((t) => ({
      id: t._id,
      customer: t.customer?.name || "Guest",
      amount: t.totalPrice,
      method: t.paymentMethod,
      date: t.paidAt || t.createdAt,
      status: "COMPLETED",
      type: "SALE",
    })),
    page,
    pages,
    pageSize,
    total,
    totalAmount,
    // Exported rows are capped; tell the client if some were left out
    truncated: exportAll && total > WALLET_EXPORT_LIMIT,
    period: period ? { start: period.start, end: period.end } : null,
  });
});

// @desc    Get bulk upload history
// @route   GET /api/admin/bulk-upload-history
// @access  Private/Admin
export const getBulkUploadHistory = asyncHandler(async (req, res) => {
  const history = await BulkUploadHistory.find()
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });
  res.json(history);
});

// @desc    Get sidebar notification counts
// @route   GET /api/admin/notification-counts
// @access  Private/Admin
export const getNotificationCounts = asyncHandler(async (req, res) => {
  // Each badge only counts items created after the admin last opened that
  // page (timestamps in ms, sent by the admin panel).
  const seenSince = (param) => {
    const ms = Number(req.query[param]);
    return { $gt: Number.isFinite(ms) && ms > 0 ? new Date(ms) : new Date(0) };
  };

  const [newOrders, newCustomers, newLeads, pendingReviews, newFormSubmissions] =
    await Promise.all([
      Order.countDocuments({ status: "Pending", createdAt: seenSince("ordersSeenAt") }),
      Customer.countDocuments({ createdAt: seenSince("customersSeenAt") }),
      Lead.countDocuments({ status: "New", createdAt: seenSince("leadsSeenAt") }),
      Review.countDocuments({ status: "Pending", createdAt: seenSince("reviewsSeenAt") }),
      FormSubmission.countDocuments({ status: "New", createdAt: seenSince("formSubmissionsSeenAt") }),
    ]);

  res.json({ newOrders, newCustomers, newLeads, pendingReviews, newFormSubmissions });
});
