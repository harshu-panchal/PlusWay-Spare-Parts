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
import { resolveDashboardRange } from "../../../utils/dateRange.js";

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
  // 1. Total Revenue (sum of value of all paid orders)
  const totalRevenueResult = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = totalRevenueResult[0]?.total || 0;

  // 2. Average Order Value
  const paidOrdersCount = await Order.countDocuments({ isPaid: true });
  const avgOrderValue = paidOrdersCount > 0 ? totalRevenue / paidOrdersCount : 0;

  // 3. New Customers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers = await Customer.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // 4. Sales by Category
  const salesByCategory = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $group: {
        _id: "$category.name",
        sales: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
      },
    },
    { $sort: { sales: -1 } },
    { $limit: 5 },
  ]);

  // Calculate percentages for categories
  const totalCategorySales = salesByCategory.reduce((acc, curr) => acc + curr.sales, 0);
  const salesByCategoryWithPercentage = salesByCategory.map((cat) => ({
    name: cat._id,
    sales: cat.sales,
    percentage: totalCategorySales > 0 ? Math.round((cat.sales / totalCategorySales) * 100) : 0,
    color: "bg-blue-500", // You might want to assign random colors or mapped colors here
  }));

  // 5. Top Brands
  const topBrands = await Order.aggregate([
    { $match: { isPaid: true } },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "brands",
        localField: "product.brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: "$brand" },
    {
      $group: {
        _id: "$brand.name",
        orders: { $sum: 1 }, // Counting items sold per brand, or distinct orders? Let's count items for now as "popularity"
      },
    },
    { $sort: { orders: -1 } },
    { $limit: 5 },
  ]);

  const topBrandsFormatted = topBrands.map((brand) => ({
    name: brand._id,
    orders: brand.orders,
    growth: "+0%", // Placeholder as we need historical data for growth
  }));

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
    totalRevenue,
    avgOrderValue,
    newCustomers,
    conversionRate: 2.5, // Mocked
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

  // 4. Transaction History (Last 50 transactions)
  const transactions = await Order.find({ isPaid: true })
    .populate("customer", "name email")
    .sort({ paidAt: -1 })
    .limit(50);

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
    transactions: transactions.map(t => ({
      id: t._id,
      customer: t.customer?.name || "Guest",
      amount: t.totalPrice,
      method: t.paymentMethod,
      date: t.paidAt || t.createdAt,
      status: "COMPLETED",
      type: "SALE"
    })),
    revenueTrend,
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
