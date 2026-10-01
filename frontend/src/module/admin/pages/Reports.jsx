import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  ShoppingCart,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PieChart as PieChartIcon,
} from 'lucide-react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import RevenueBars from "../components/RevenueBars";
import RangePicker from "../components/RangePicker";
import { formatInr } from "../../../utils/formatInr";
import { getChange, getRangeOption, getStoredRange, saveRange } from "../../../utils/dateRanges";

const RANGE_STORAGE_KEY = "adminReportsRange";

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

// Green up / red down / grey flat badge for a change vs the previous period
const ChangeBadge = ({ change, title }) => {
  if (!change) return null;
  const color = change.direction > 0 ? 'text-green-500' : change.direction < 0 ? 'text-red-500' : 'text-gray-400';
  const Icon = change.direction > 0 ? ArrowUpRight : change.direction < 0 ? ArrowDownRight : Minus;
  return (
    <div title={title} className={`flex items-center gap-1 text-sm font-bold ${color}`}>
      <Icon size={16} />
      {change.label}
    </div>
  );
};

const Reports = () => {
  const [range, setRange] = useState(() => getStoredRange(RANGE_STORAGE_KEY, "7d"));
  // `result.range` says which period the loaded data is for; it's loading
  // while that differs from the selected range.
  const [result, setResult] = useState({ range: null, data: null, error: null });
  const { data, error } = result;
  const refreshing = result.range !== range;
  const loading = refreshing && !data && !error;

  useEffect(() => {
    saveRange(RANGE_STORAGE_KEY, range);
    let cancelled = false;
    axios
      .get(API_ENDPOINTS.ADMIN_REPORTS_STATS, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        params: { range },
      })
      .then(({ data }) => !cancelled && setResult({ range, data, error: null }))
      .catch(() => !cancelled && setResult((prev) => ({ ...prev, range, error: "Failed to fetch reports data" })));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangeOption = getRangeOption(range);
  const previous = data?.previous || null;
  const compareTitle = (format, key) =>
    previous ? `${rangeOption.compareLabel}: ${format(previous[key] || 0)}` : undefined;

  const stats = [
    {
      name: "Total Revenue",
      value: formatInr(data?.totalRevenue || 0),
      change: getChange(data?.totalRevenue || 0, previous?.totalRevenue),
      title: compareTitle(formatInr, "totalRevenue"),
      icon: TrendingUp,
    },
    {
      name: "Average Order Value",
      value: formatInr(data?.avgOrderValue || 0),
      change: getChange(Math.round(data?.avgOrderValue || 0), previous ? Math.round(previous.avgOrderValue || 0) : null),
      title: compareTitle(formatInr, "avgOrderValue"),
      icon: ShoppingBag,
    },
    {
      name: "New Customers",
      value: (data?.newCustomers || 0).toLocaleString(),
      change: getChange(data?.newCustomers || 0, previous?.newCustomers),
      title: compareTitle((v) => v.toLocaleString(), "newCustomers"),
      icon: Users,
    },
    {
      name: "Paid Orders",
      value: (data?.paidOrders || 0).toLocaleString(),
      change: getChange(data?.paidOrders || 0, previous?.paidOrders),
      title: compareTitle((v) => v.toLocaleString(), "paidOrders"),
      icon: ShoppingCart,
    },
  ];

  const handleExport = () => {
    if (!data) return;

    // 1. Overview Data
    const overviewData = stats.map(stat => ({
      Metric: stat.name,
      Period: rangeOption.label,
      Value: stat.value,
      Change: stat.change?.label ?? ""
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
      "Growth": brand.growth ?? ""
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
    saveAs(blob, `Analytics_Report_${range}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          <RangePicker value={range} onChange={setRange} busy={refreshing} />
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black transition-all text-sm font-bold">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity ${refreshing ? "opacity-60" : ""}`}>
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-xl text-secondary">
                <stat.icon size={24} />
              </div>
              <ChangeBadge change={stat.change} title={stat.title} />
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.name}</p>
            <h3 className="text-2xl font-black text-secondary tracking-tighter">{stat.value}</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-2">
              {previous ? rangeOption.compareLabel : rangeOption.label}
            </p>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity ${refreshing ? "opacity-60" : ""}`}>
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
            {salesByCategory.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No paid sales in this period.</p>
            )}
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
                {topBrands.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-6 text-sm text-gray-400 text-center">No paid sales in this period.</td>
                  </tr>
                )}
                {topBrands.map((brand, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-secondary">{brand.name}</td>
                    <td className="py-4 text-center font-bold text-gray-600">{brand.orders}</td>
                    <td className="py-4 text-right">
                      {brand.growth ? (
                        <span
                          title={brand.previousOrders != null ? `${rangeOption.compareLabel}: ${brand.previousOrders} orders` : undefined}
                          className={`px-2 py-1 rounded text-xs font-black tracking-tighter ${
                            brand.growth.startsWith("-")
                              ? "bg-red-50 text-red-600"
                              : brand.growth === "+0%" || brand.growth === "0%"
                                ? "bg-gray-100 text-gray-500"
                                : "bg-green-50 text-green-600"
                          }`}>
                          {brand.growth}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
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
