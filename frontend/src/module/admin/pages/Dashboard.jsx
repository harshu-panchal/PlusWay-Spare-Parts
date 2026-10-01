import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import { formatInr } from "../../../utils/formatInr";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Smartphone,
  Box,
} from "lucide-react";
import RangePicker from "../components/RangePicker";
import { getChange, getRangeOption, getStoredRange, saveRange } from "../../../utils/dateRanges";

const RANGE_STORAGE_KEY = "adminDashboardRange";

const Dashboard = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState(() => getStoredRange(RANGE_STORAGE_KEY));
  const [data, setData] = useState({
    revenue: 0,
    orders: 0,
    newCustomers: 0,
    productsSold: 0,
    previous: null,
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalModels: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    saveRange(RANGE_STORAGE_KEY, range);

    let cancelled = false;
    const fetchData = async () => {
      setRefreshing(true);
      try {
        const token = localStorage.getItem("adminToken");
        const { data } = await axios.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS, {
          headers: { Authorization: `Bearer ${token}` },
          params: { range },
        });
        if (cancelled) return;
        setData(data);
        setError(null);
      } catch {
        if (!cancelled) setError("Failed to fetch dashboard data");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangeOption = getRangeOption(range);
  const previous = data.previous;

  // Metrics for the selected period, compared with the previous one
  const periodStat = (name, key, format = (v) => v.toLocaleString()) => ({
    name,
    value: format(data[key] || 0),
    change: getChange(data[key] || 0, previous ? previous[key] : null),
    footer: previous ? rangeOption.compareLabel : rangeOption.label,
    previousValue: previous ? format(previous[key] || 0) : null,
  });

  // Catalog totals: not tied to the period
  const catalogStat = (name, key) => ({
    name,
    value: (data[key] || 0).toLocaleString(),
    change: null,
    footer: "All time",
    previousValue: null,
  });

  const stats = [
    {
      ...periodStat("Revenue", "revenue", formatInr),
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      href: "/admin/orders",
    },
    {
      ...periodStat("Orders", "orders"),
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      href: "/admin/orders",
    },
    {
      ...periodStat("New Customers", "newCustomers"),
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      href: "/admin/customers",
    },
    {
      ...periodStat("Products Sold", "productsSold"),
      icon: Package,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      href: "/admin/orders",
    },
    {
      ...catalogStat("Total Products", "totalProducts"),
      icon: Box,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      href: "/admin/products",
    },
    {
      ...catalogStat("Total Categories", "totalCategories"),
      icon: Layers,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-100",
      href: "/admin/categories",
    },
    {
      ...catalogStat("Total Brands", "totalBrands"),
      icon: ShieldCheck,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-100",
      href: "/admin/brands",
    },
    {
      ...catalogStat("Total Models", "totalModels"),
      icon: Smartphone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      href: "/admin/models",
    },
  ];

  const handleExport = () => {
    // 1. Prepare Overview Data
    const overviewData = stats.map(stat => ({
      Metric: stat.name,
      Period: stat.footer === "All time" ? "All time" : rangeOption.label,
      Value: stat.value,
      "Previous Period": stat.previousValue ?? "",
      Change: stat.change?.label ?? ""
    }));

    // 2. Prepare Recent Orders Data
    const ordersData = data.recentOrders.map(order => ({
      "Order ID": order._id,
      "Date": new Date(order.createdAt).toLocaleDateString(),
      "Time": new Date(order.createdAt).toLocaleTimeString(),
      "Customer Name": order.customer?.name || "Unknown",
      "Customer Email": order.customer?.email || "N/A",
      "Status": order.isDelivered ? "Delivered" : "Pending",
      "Payment Method": order.paymentMethod,
      "Total Amount (₹)": order.totalPrice
    }));

    // 3. Prepare Low Stock Data
    const lowStockData = data.lowStockProducts.map(product => ({
      "Product Name": product.name,
      "SKU": product.code || "N/A",
      "Stock Left": product.countInStock,
      "Price (₹)": product.price
    }));

    // 4. Create Workbook and Sheets
    const wb = XLSX.utils.book_new();
    
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    const wsOrders = XLSX.utils.json_to_sheet(ordersData);
    const wsStock = XLSX.utils.json_to_sheet(lowStockData);

    // Adjust column widths
    wsOverview["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 10 }];
    wsOrders["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
    wsStock["!cols"] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");
    XLSX.utils.book_append_sheet(wb, wsOrders, "Recent Orders");
    XLSX.utils.book_append_sheet(wb, wsStock, "Low Stock Alerts");

    // 5. Generate and Download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Dashboard_Report_${range}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RangePicker value={range} onChange={setRange} busy={refreshing} />
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity ${refreshing ? "opacity-60" : ""}`}>
        {stats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.href)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all group cursor-pointer">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-colors`}>
                <stat.icon size={22} />
              </div>
              {stat.change && (
                <div
                  title={stat.previousValue !== null ? `Previous period: ${stat.previousValue}` : undefined}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                    stat.change.direction > 0
                      ? "bg-emerald-50 text-emerald-600"
                      : stat.change.direction < 0
                        ? "bg-rose-50 text-rose-600"
                        : "bg-gray-100 text-gray-500"
                  }`}>
                  {stat.change.direction > 0 ? (
                    <ArrowUpRight size={12} />
                  ) : stat.change.direction < 0 ? (
                    <ArrowDownRight size={12} />
                  ) : (
                    <Minus size={12} />
                  )}
                  {stat.change.label}
                </div>
              )}
            </div>
            <div className="mt-5">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                {stat.name}
              </h3>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-medium">
                {stat.previousValue !== null
                  ? `${stat.footer} (${stat.previousValue})`
                  : stat.footer}
              </span>
              <ExternalLink size={12} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage and track your latest customer orders.
              </p>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => window.location.href = `/admin/orders/${order._id}`}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          #{order._id.substring(order._id.length - 6)}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                            {order.customer?.name
                              ? order.customer.name.substring(0, 2)
                              : "U"}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {order.customer?.name || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${!order.isDelivered
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                            }`}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${!order.isDelivered
                              ? "bg-amber-600"
                              : "bg-emerald-600"
                              }`}></span>
                          {!order.isDelivered ? "PENDING" : "DELIVERED"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-gray-900">
                        ₹{order.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500 text-sm">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-50 bg-white">
            <h3 className="text-lg font-bold text-gray-900">
              Inventory Alerts
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Products running low on stock.
            </p>
          </div>
          <div className="p-6 space-y-4">
            {data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-blue-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden p-2 flex items-center justify-center shrink-0">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="text-gray-300" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">
                        SKU: {product.code || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg mb-1">
                      {product.countInStock} Left
                    </span>
                    <button className="block text-[10px] text-blue-600 font-bold hover:underline">
                      RESTOCK
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No inventory alerts.
              </p>
            )}
          </div>
          <div className="mt-auto p-6 pt-0">
            <button className="w-full py-3 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors">
              VIEW ALL INVENTORY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
