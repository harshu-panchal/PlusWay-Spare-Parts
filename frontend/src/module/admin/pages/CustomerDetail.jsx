import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Package,
    Clock,
    ChevronLeft,
    ShoppingBag,
    CreditCard,
    Ban,
    Trash2,
    Edit
} from "lucide-react";

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    const fetchCustomerDetails = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get(
                API_ENDPOINTS.ADMIN_CUSTOMER_DETAIL(id),
                config
            );
            setCustomer(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch customer details");
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center font-bold">Loading customer details...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/admin/customers")}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        {customer.name}
                        <span
                            className={`text-sm px-3 py-1 rounded-full border ${customer.status === "Active"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : "bg-red-50 border-red-200 text-red-700"
                                }`}
                        >
                            {customer.status}
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm">Customer ID: {customer._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Stats */}
                <div className="space-y-6">

                    {/* Personal Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={18} /> Personal Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Phone Number</p>
                                    <p className="text-sm font-semibold text-gray-900">{customer.mobile}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase">Joined Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(customer.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <ShoppingBag size={18} /> Purchase History
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-2xl font-black text-gray-800">{customer.totalOrders}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                <p className="text-2xl font-black text-gray-800">₹{customer.totalSpent?.toLocaleString()}</p>
                                <p className="text-xs font-bold text-gray-500 uppercase">Total Spent</p>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin size={18} /> Addresses
                        </h3>
                        {customer.addresses && customer.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {customer.addresses.map((addr, idx) => (
                                    <div key={addr._id || idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                        <p className="font-bold text-gray-800 flex items-center gap-2">
                                            {addr.type === 'Home' ? '🏠 Home' : '🏢 Work'}
                                        </p>
                                        <p className="text-gray-600 mt-1">
                                            {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No addresses saved.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Orders List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} /> Recent Orders
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Payment</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customer.orders && customer.orders.length > 0 ? (
                                        customer.orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-blue-600">
                                                    <Link to={`/admin/orders/${order._id}`} className="hover:underline">
                                                        #{order._id.slice(-6).toUpperCase()}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    ₹{order.totalPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {order.isPaid ? "Paid" : "Unpaid"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? "bg-green-100 text-green-700" :
                                                        order.status === 'Cancelled' ? "bg-red-100 text-red-700" :
                                                            "bg-blue-100 text-blue-700"
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                        className="size-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                    >
                                                        <ChevronLeft size={16} className="rotate-180" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-400 font-bold italic">
                                                No recent orders found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
