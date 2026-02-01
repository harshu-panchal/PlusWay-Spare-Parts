import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState({
    revenue: 0,
    activeOrders: 0,
    totalCustomers: 0,
    productsSold: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(
          API_ENDPOINTS.ADMIN_DASHBOARD_STATS,
          config
        );

        setData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      name: "Total Revenue",
      value: `₹${data.revenue.toLocaleString()}`,
      icon: TrendingUp,
      change: "+12.5%", // Keep hardcoded for now or calculate if historical data exists
      isPositive: true,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      name: "Active Orders",
      value: data.activeOrders,
      icon: ShoppingCart,
      change: "+5.2%",
      isPositive: true,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      name: "Total Customers",
      value: data.totalCustomers,
      icon: Users,
      change: "+18.7%",
      isPositive: true,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      name: "Products Sold",
      value: data.productsSold,
      icon: Package,
      change: "-2.4%",
      isPositive: false,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
  ];

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
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 shadow-sm">
            <Clock size={16} />
            Last 30 Days
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            Download Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-default`}>
            <div className="flex justify-between items-start">
              <div
                className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} transition-colors`}>
                <stat.icon size={22} />
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {stat.isPositive ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {stat.change}
              </div>
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
                vs previous period
              </span>
              <ExternalLink
                size={12}
                className="text-gray-300 group-hover:text-blue-500 transition-colors"
              />
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
