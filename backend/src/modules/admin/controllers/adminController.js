import Admin from "../../../models/Admin.js";
import Order from "../../../models/Order.js";
import Customer from "../../../models/Customer.js";
import Product from "../../../models/Product.js";
import generateToken from "../../../utils/generateToken.js";
import asyncHandler from "../../../middleware/asyncHandler.js";

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
  // 1. Total Revenue (sum of value of all paid orders)
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        status: { $ne: "Cancelled" }, // Assuming there might be a status field, though Order model usually has isDelivered. Let's rely on isPaid for revenue.
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  // 2. Active Orders (not delivered)
  const activeOrders = await Order.countDocuments({
    isDelivered: false,
  });

  // 3. Total Customers
  const totalCustomers = await Customer.countDocuments();

  // 4. Products Sold
  const productsSold = await Order.aggregate([
    {
      $match: {
        isPaid: true,
      },
    },
    {
      $unwind: "$orderItems",
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$orderItems.qty" },
      },
    },
  ]);

  // 5. Recent Orders (limit 5)
  const recentOrders = await Order.find()
    .populate("customer", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  // 6. Low Stock Alerts (countInStock <= 5)
  const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } })
    .sort({ countInStock: 1 })
    .limit(5);

  res.json({
    revenue: totalRevenue[0]?.total || 0,
    activeOrders,
    totalCustomers,
    productsSold: productsSold[0]?.total || 0,
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
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } }
  ]);

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
