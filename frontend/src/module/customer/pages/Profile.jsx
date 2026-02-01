import React, { useState, useEffect } from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  ShieldCheck,
  Star,
  Truck,
  Download,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import ProfileSidebar from "../components/ProfileSidebar";
import { API_ENDPOINTS } from "../../../config/api";

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    shipped: 0,
    reviews: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login");
      return;
    }
    fetchMyOrders();
  }, [navigate]);

  const [trackOrderId, setTrackOrderId] = useState("");

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (trackOrderId.trim()) {
      navigate(`/order/${trackOrderId}`);
    }
  };

  const getOrderStatus = (order) => {
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";
    return "Pending";
  };

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        API_ENDPOINTS.MY_ORDERS,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Sort by date desc
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);

      // Calculate stats
      const pendingCount = sortedOrders.filter(
        (o) => !o.isPaid
      ).length;
      const processingCount = sortedOrders.filter((o) => o.isPaid && !o.isDelivered).length;
      const deliveredCount = sortedOrders.filter((o) => o.isDelivered).length;

      setStats({
        pending: pendingCount,
        shipped: deliveredCount, // Using delivered for shipped metric for now
        reviews: 0,
      });

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-purple-100 text-purple-700";
      case "Processing":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          ACCOUNT <span className="text-primary italic">OVERVIEW</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">

            {/* Track Order Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter mb-4">
                Track your <span className="text-primary italic">Order</span>
              </h2>
              <form onSubmit={handleTrackOrder} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Order ID"
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-primary text-secondary"
                />
                <button type="submit" className="bg-secondary text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-black transition-all">
                  Track
                </button>
              </form>
            </div>

            {/* Orders Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Pending", count: stats.pending, icon: <Clock /> },
                { name: "Delivered", count: stats.shipped, icon: <Truck /> }, // Labelled Delivered to match logic
                { name: "Reviews", count: stats.reviews, icon: <Star /> },
              ].map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-black text-secondary tracking-tighter">
                      {stat.count}
                    </p>
                  </div>
                  <div className="text-primary opacity-20">{stat.icon}</div>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Recent <span className="text-primary italic">Orders</span>
                </h2>
                <Link
                  to="/profile/orders"
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <p className="text-center font-bold text-gray-400 uppercase tracking-widest py-8">
                    Loading your orders...
                  </p>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500 font-bold uppercase tracking-widest">
                      {error}
                    </p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest">
                      No orders found
                    </p>
                    <Link
                      to="/"
                      className="text-primary text-xs font-black uppercase mt-4 inline-block hover:underline">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  orders.slice(0, 5).map((order) => {
                    const status = getOrderStatus(order);
                    return (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="p-6 rounded-2xl border border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                            <Package size={24} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-secondary uppercase tracking-tighter">
                              ORDER #{order._id.slice(-6).toUpperCase()}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 md:gap-8">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                              Total Amount
                            </p>
                            <p className="text-sm font-black text-secondary tracking-tighter">
                              ₹{order.totalPrice.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                          <button className="p-2 bg-white rounded-lg text-secondary hover:text-primary transition-all shadow-sm">
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
