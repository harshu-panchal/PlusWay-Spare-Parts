import React, { useCallback, useEffect, useState } from "react";
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
  MessageSquare,
  Loader,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import ProfileSidebar from "../components/ProfileSidebar";
import { API_ENDPOINTS } from "../../../config/api";
import useInfiniteScroll from "../../../hooks/useInfiniteScroll";

const REVIEW_PAGE_SIZE = 20;

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, reviews
  const [stats, setStats] = useState({
    pending: 0,
    shipped: 0,
    reviews: 0,
  });
  const navigate = useNavigate();

  // Chunked reviews fetcher used by the infinite-scroll hook below.
  const fetchReviewsPage = useCallback(async (page) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${API_ENDPOINTS.MY_REVIEWS}?pageNumber=${page}&pageSize=${REVIEW_PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const items = data.reviews || [];
      const totalPages = data.pages || 1;
      return {
        items,
        hasMore: page < totalPages,
        total: data.total || items.length,
      };
    } catch {
      // Reviews API may not be available for new users — degrade gracefully.
      return { items: [], hasMore: false, total: 0 };
    }
  }, []);

  const {
    items: reviews,
    loading: reviewsLoading,
    hasMore: hasMoreReviews,
    total: totalReviews,
    sentinelRef: reviewsSentinelRef,
  } = useInfiniteScroll({
    fetchPage: fetchReviewsPage,
    resetKey: "my-reviews",
  });

  // Keep the "Reviews" stats card in sync with the hook's total.
  useEffect(() => {
    setStats((s) => ({ ...s, reviews: totalReviews }));
  }, [totalReviews]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login");
      return;
    }
    fetchMeta();
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

  // One-shot fetch of recent orders (used for the overview list and stat
  // counts). Reviews are paged independently by the hook above.
  const fetchMeta = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const ordersRes = await axios.get(API_ENDPOINTS.MY_ORDERS, config);
      const sortedOrders = (ordersRes.data.orders || ordersRes.data).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sortedOrders);

      const pendingCount = sortedOrders.filter((o) => !o.isPaid).length;
      const deliveredCount = sortedOrders.filter((o) => o.isDelivered).length;
      setStats((s) => ({
        ...s,
        pending: pendingCount,
        shipped: deliveredCount,
      }));

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch profile data");
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
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Pending", count: stats.pending, icon: <Clock /> },
                { name: "Delivered", count: stats.shipped, icon: <Truck /> },
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

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`nav-btn px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all whitespace-nowrap ${
                  activeTab === "overview"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-secondary"
                }`}>
                Overview
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`nav-btn px-4 py-2 font-bold uppercase tracking-wider text-sm transition-all whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-400 hover:text-secondary"
                }`}>
                My Reviews
              </button>
            </div>

            {loading ? (
              <p className="text-center font-bold text-gray-400 uppercase tracking-widest py-8">
                Loading...
              </p>
            ) : activeTab === "overview" ? (
              <>
                {/* Track Order Section */}
                <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                  <h2 className="text-lg md:text-xl font-black text-secondary uppercase italic tracking-tighter mb-4 md:mb-6">
                    Track your{" "}
                    <span className="text-primary italic">Order</span>
                  </h2>
                  <form
                    onSubmit={handleTrackOrder}
                    className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      placeholder="Enter Order ID"
                      value={trackOrderId}
                      onChange={(e) => setTrackOrderId(e.target.value)}
                      className="w-full md:w-auto md:flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 md:py-4 font-bold focus:outline-none focus:border-primary text-secondary transition-all placeholder:text-sm md:placeholder:text-base"
                    />
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-secondary text-white font-black px-8 py-3 md:py-4 rounded-xl uppercase tracking-widest hover:bg-black transition-all text-sm md:text-base shadow-lg shadow-secondary/20">
                      Track
                    </button>
                  </form>
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
                    {error ? (
                      <div className="text-center py-12">
                        <p className="text-red-500 font-bold uppercase tracking-widest">
                          {error}
                        </p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package
                          size={48}
                          className="mx-auto text-gray-200 mb-4"
                        />
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
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
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
              </>
            ) : (
              /* Reviews Tab */
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter mb-8">
                  My <span className="text-primary italic">Reviews</span>
                </h2>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare
                      size={48}
                      className="mx-auto text-gray-200 mb-4"
                    />
                    <p className="text-gray-400 font-bold uppercase tracking-widest">
                      You haven't written any reviews yet
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {reviews.map((review) => (
                      <div
                        key={review._id}
                        className="p-6 rounded-2xl border border-gray-50 bg-gray-50/50 flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-32 flex-shrink-0">
                          <div className="aspect-square bg-white rounded-xl p-2 border border-gray-100 flex items-center justify-center">
                            {review.product?.images?.[0] ? (
                              <img
                                src={review.product.images[0] || null}
                                alt={review.product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="text-gray-200" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-secondary line-clamp-1">
                              {review.product?.name || "Unknown Product"}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                review.status === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : review.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }`}>
                              {review.status}
                            </span>
                          </div>
                          <div className="flex text-yellow-400 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? "fill-current"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm italic mb-4">
                            "{review.comment}"
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Posted on{" "}
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                          {review.adminReply && (
                            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">
                                Response from Admin
                              </p>
                              <p className="text-sm text-gray-700">
                                {review.adminReply}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Infinite-scroll sentinel + loading / end-of-list indicators */}
                <div ref={reviewsSentinelRef} aria-hidden="true" className="h-1" />

                {reviewsLoading && reviews.length > 0 && (
                  <div className="flex items-center justify-center gap-3 py-6 text-gray-500 font-bold uppercase tracking-widest text-xs">
                    <Loader size={16} className="animate-spin text-primary" />
                    Loading more…
                  </div>
                )}

                {!hasMoreReviews && reviews.length > 0 && (
                  <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">
                    Showing all {totalReviews || reviews.length} reviews
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
