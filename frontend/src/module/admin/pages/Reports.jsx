import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';
import { brands, categories } from '../../customer/data/mockData';

import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const Reports = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [data, setData] = useState(null);
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
          API_ENDPOINTS.ADMIN_REPORTS_STATS,
          config
        );

        setData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch reports data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      name: "Total Revenue",
      value: data ? `₹${data.totalRevenue.toLocaleString()}` : "₹0",
      change: "+12.5%", // Keep mocked or calculate if history available
      trend: "up",
      icon: TrendingUp,
    },
    {
      name: "Average Order Value",
      value: data ? `₹${Math.round(data.avgOrderValue).toLocaleString()}` : "₹0",
      change: "+3.2%",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      name: "New Customers",
      value: data ? data.newCustomers : 0,
      change: "-2.1%",
      trend: "down",
      icon: Users,
    },
    {
      name: "Conversion Rate",
      value: data ? `${data.conversionRate}%` : "0%",
      change: "+0.8%",
      trend: "up",
      icon: BarChart3,
    },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const salesByCategory = data ? data.salesByCategory : [];
  const topBrands = data ? data.topBrands : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">
            Analytics & <span className="text-primary italic">Reports</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">Monitor your business performance and sales trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm font-bold text-gray-700 cursor-pointer"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black transition-all text-sm font-bold">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-xl text-secondary">
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.name}</p>
            <h3 className="text-2xl font-black text-secondary tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-secondary uppercase tracking-tight flex items-center gap-2">
              <PieChartIcon size={20} className="text-primary" />
              Sales by Category
            </h3>
            <button className="text-primary hover:underline text-xs font-black uppercase tracking-widest">Details</button>
          </div>
          <div className="space-y-6">
            {salesByCategory.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">{category.name}</span>
                  <span className="font-black text-secondary">₹{category.sales.toLocaleString()} ({category.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${category.color} transition-all duration-1000`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Brands */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-secondary uppercase tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Top Brands Performance
            </h3>
            <button className="text-primary hover:underline text-xs font-black uppercase tracking-widest">Full List</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest">Brand</th>
                  <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Orders</th>
                  <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topBrands.map((brand, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-secondary">{brand.name}</td>
                    <td className="py-4 text-center font-bold text-gray-600">{brand.orders}</td>
                    <td className="py-4 text-right">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-black tracking-tighter">
                        {brand.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Sales Trend Placeholder */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-black text-secondary uppercase tracking-tight">Sales Trend (Last 6 Months)</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs font-bold text-gray-500">Revenue</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-xs font-bold text-gray-500">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-4 px-4">
          {data && data.monthlySales && data.monthlySales.length > 0 ? (
            data.monthlySales.map((item, index) => {
              // Find max values for scaling
              const maxRevenue = Math.max(...data.monthlySales.map(i => i.revenue));
              const maxOrders = Math.max(...data.monthlySales.map(i => i.orders));

              const revenueHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              const ordersHeight = maxOrders > 0 ? (item.orders / maxOrders) * 100 : 0;

              const monthName = new Date(0, item._id - 1).toLocaleString('default', { month: 'short' });

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex justify-center gap-1 h-full items-end">
                    <div
                      className="w-full max-w-[20px] bg-primary rounded-t-lg transition-all duration-1000 group relative"
                      style={{ height: `${revenueHeight}%` }}
                    >
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        ₹{item.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="w-full max-w-[20px] bg-secondary/20 rounded-t-lg transition-all duration-1000 group relative"
                      style={{ height: `${ordersHeight * 0.7}%` }}
                    >
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {item.orders} Orders
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {monthName}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No sales data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
