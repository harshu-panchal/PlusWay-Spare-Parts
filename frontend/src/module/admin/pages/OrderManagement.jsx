import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import Pagination from "../../../components/Pagination";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("adminInfo"))?.token;
      const { data } = await axios.get(
        `${API_ENDPOINTS.ADMIN_ORDERS}?pageNumber=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setOrders(data.orders);
      setPages(data.pages);
      setTotal(data.total);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        API_ENDPOINTS.ADMIN_ORDER_STATUS(orderId),
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchOrders(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        API_ENDPOINTS.ADMIN_ORDER_INVOICE(orderId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to download invoice");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading)
    return <div className="p-8 text-center font-bold">Loading orders...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-bottom border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Order ID
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Payment
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-secondary">
                    <button onClick={() => navigate(`/admin/orders/${order._id}`)} className="hover:text-primary transition-colors">
                      #{order._id.slice(-6).toUpperCase()}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-secondary">
                      {order.customer?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-black text-secondary">
                    ₹{order.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${getStatusColor(
                        order.status,
                      )} border-none focus:ring-0 cursor-pointer`}
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {order.isPaid ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <Clock size={14} className="text-yellow-500" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => downloadInvoice(order._id)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all shadow-sm">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />
      <p className="text-center text-xs text-gray-400 mt-2">
        Total {total} orders found
      </p>
    </div>
  );
};

export default OrderManagement;
