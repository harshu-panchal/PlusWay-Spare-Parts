import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import {
    CheckCircle2,
    AlertCircle,
    MapPin,
    CreditCard,
    Truck,
    Clock,
    User,
    ChevronLeft,
    Package,
    Save,
    Printer
} from "lucide-react";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("adminToken");
                const { data } = await axios.get(
                    API_ENDPOINTS.ADMIN_ORDER_DETAIL(id),
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setOrder(data);
                setStatus(data.status);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch order details");
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusUpdate = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            await axios.put(
                API_ENDPOINTS.ADMIN_ORDER_STATUS(id),
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            // Refresh local state
            const { data } = await axios.get(
                API_ENDPOINTS.ADMIN_ORDER_DETAIL(id),
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setOrder(data);
            alert("Order status updated successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    const markAsDelivered = async () => {
        // Logic to specifically mark delivered if separate endpoint exists, 
        // else status update handles it. 
        // Typically Admin might want a specific "Mark as Delivered" button or just use the dropdown.
        // We will use the dropdown for now as it covers all states.
        handleStatusUpdate();
    };


    if (loading) return <div className="p-8 text-center font-bold">Loading order details...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        Order #{order._id}
                        <span className={`text-sm px-3 py-1 rounded-full border ${order.isPaid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                            {order.isPaid ? 'PAID' : 'NOT PAID'}
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-600">
                        <Printer size={18} />
                        Print Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} /> Order Items
                            </h3>
                            <span className="text-sm font-bold text-gray-500">{order.orderItems.length} Items</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="p-6 flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Link to={`/admin/products/${item.product}`} className="font-bold text-gray-800 hover:text-blue-600 text-lg">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500">Unit Price: ₹{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 text-lg">
                                            ₹{(item.qty * item.price).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User size={18} /> Customer Details
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-800">{order.user?.name || order.customer?.name}</p>
                                <p className="text-sm text-gray-500">{order.user?.email || order.customer?.email}</p>
                                <p className="text-sm text-gray-500">ID: {order.user?._id || "N/A"}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <MapPin size={18} /> Shipping Address
                            </h3>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
                                <p className="text-sm text-gray-600">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                                </p>
                                <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status & Actions Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={18} /> Order Status
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Change Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Update Status
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard size={18} /> Payment Info
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Method</span>
                                <span className="text-sm font-bold text-gray-800 uppercase">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.isPaid ? 'PAID' : 'PENDING'}
                                </span>
                            </div>
                            {order.isPaid && (
                                <div className="text-xs text-gray-400 mt-2">
                                    Paid at: {new Date(order.paidAt).toLocaleString()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
