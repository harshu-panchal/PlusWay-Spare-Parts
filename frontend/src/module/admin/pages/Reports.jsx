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
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import RevenueBars from "../components/RevenueBars";
import { formatInr } from "../../../utils/formatInr";

// Month key from the API: "YYYY-MM" (older backends sent just the month
// number 1-12). Returns e.g. "Oct" or, with `long`, "October 2026".
const formatMonth = (key, long = false) => {
  const [year, month] = String(key).includes("-")
    ? String(key).split("-").map(Number)
    : [new Date().getFullYear(), Number(key)];
  return new Date(year, month - 1, 1).toLocaleString("default", long
    ? { month: "long", year: "numeric" }
    : { month: "short" });
};

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

  const handleExport = () => {
    if (!data) return;

    // 1. Overview Data
    const overviewData = stats.map(stat => ({
      Metric: stat.name,
      Value: stat.value,
      Trend: stat.trend,
      Change: stat.change
    }));

    // 2. Sales By Category
    const categoryData = (data.salesByCategory || []).map(cat => ({
      "Category Name": cat.name,
      "Sales (₹)": cat.sales,
      "Percentage (%)": cat.percentage
    }));

    // 3. Top Brands
    const brandData = (data.topBrands || []).map(brand => ({
      "Brand Name": brand.name,
      "Total Orders": brand.orders,
      "Growth": brand.growth
    }));

    // 4. Monthly Sales
    const monthlyData = (data.monthlySales || []).map(month => ({
      "Month": formatMonth(month._id, true),
      "Revenue (₹)": month.revenue,
      "Orders": month.orders
    }));

    // Create Workbook
    const wb = XLSX.utils.book_new();

    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    const wsCategory = XLSX.utils.json_to_sheet(categoryData);
    const wsBrand = XLSX.utils.json_to_sheet(brandData);
    const wsMonthly = XLSX.utils.json_to_sheet(monthlyData);

    // Adjust column widths
    wsOverview["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 10 }];
    wsCategory["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    wsBrand["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    wsMonthly["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");
    XLSX.utils.book_append_sheet(wb, wsCategory, "Sales by Category");
    XLSX.utils.book_append_sheet(wb, wsBrand, "Top Brands");
    XLSX.utils.book_append_sheet(wb, wsMonthly, "Monthly Sales");

    // Download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black transition-all text-sm font-bold">
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

      {/* Monthly Sales Trend */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-secondary uppercase tracking-tight">Sales Trend (Last 6 Months)</h3>
            <p className="text-xs text-gray-500 mt-1">Paid order revenue per month (IST). Order counts shown under each month.</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatInr((data?.monthlySales || []).reduce((sum, m) => sum + m.revenue, 0))}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">6-month total</p>
          </div>
        </div>
        <RevenueBars
          heightClass="h-64"
          showOrdersOnAxis
          points={(data?.monthlySales || []).map((m) => ({
            key: String(m._id),
            label: formatMonth(m._id),
            revenue: m.revenue,
            orders: m.orders,
          }))}
          emptyText="No paid orders in the last 6 months"
          tableCaption="Monthly paid order revenue, last 6 months"
        />
      </div>
    </div>
  );
};

export default Reports;
