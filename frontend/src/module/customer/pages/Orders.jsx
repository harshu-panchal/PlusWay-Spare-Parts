import React, { useState, useEffect } from "react";
import { Package, ChevronRight, Clock, Truck, Star, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileSidebar from "../components/ProfileSidebar";
import { API_ENDPOINTS } from "../../../config/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login");
      return;
    }
    fetchMyOrders();
  }, [navigate]);

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
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      setLoading(false);
    }
  };

  const getOrderStatus = (order) => {
    if (order.isDelivered) return "Delivered";
    if (order.isPaid) return "Processing";
    return "Pending";
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
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          MY <span className="text-primary italic">ORDERS</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Order <span className="text-primary italic">History</span>
                </h2>
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
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                      No orders found
                    </p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const status = getOrderStatus(order);
                    return (
                      <div
                        key={order._id}
                        onClick={() => navigate(`/order/${order._id}`)}
                        className="group border border-gray-100 rounded-2xl p-4 hover:border-primary transition-all bg-gray-50/30 cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-secondary group-hover:text-primary transition-colors shadow-sm">
                              <Package size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-xs font-black text-secondary uppercase tracking-wider">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                            <p className="text-sm font-black text-secondary tracking-tighter">
                              ₹{order.totalPrice.toLocaleString()}
                            </p>
                            <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all">
                              <ChevronRight size={18} />
                            </button>
                          </div>
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

export default Orders;
