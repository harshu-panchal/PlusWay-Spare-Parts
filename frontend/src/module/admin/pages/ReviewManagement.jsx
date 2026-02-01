import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  User,
  X,
  Send,
  Reply,
} from "lucide-react";

const ReviewManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        API_ENDPOINTS.ADMIN_REVIEWS,
        config
      );

      const formattedReviews = data.map(review => ({
        id: review._id,
        author: review.name,
        date: new Date(review.createdAt).toLocaleDateString(),
        content: review.comment,
        rating: review.rating,
        status: review.status,
        adminReply: review.adminReply,
        productName: review.product?.name || "Unknown Product",
        productId: review.product?._id,
        productImage: review.product?.images?.[0] || "",
      }));

      setAllReviews(formattedReviews);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setIsModalOpen(true);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(
        API_ENDPOINTS.ADMIN_REVIEW_DETAIL(reviewId),
        { status: newStatus },
        config
      );
      fetchReviews();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.put(
        API_ENDPOINTS.ADMIN_REVIEW_DETAIL(selectedReview.id),
        {
          adminReply: replyText,
          status: "Approved"
        },
        config
      );

      fetchReviews();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to reply", error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(
        API_ENDPOINTS.ADMIN_REVIEW_DETAIL(reviewId),
        config
      );
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review", error);
    }
  };

  const filteredReviews = allReviews.filter(
    (r) =>
      (r.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.content || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.productName || "").toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <Filter size={18} />
            <span>Pending Moderation</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 transition-all hover:border-blue-100">
            <div className="w-full md:w-48 flex-shrink-0">
              <div className="aspect-square rounded-lg border border-gray-100 bg-gray-50 overflow-hidden mb-2">
                <img
                  src={review.productImage}
                  alt=""
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-xs font-bold text-gray-900 line-clamp-2">
                {review.productName}
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.author}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{review.date}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${review.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : review.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                          }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < review.rating ? "fill-current" : "text-gray-200"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  "{review.content}"
                </p>

                {review.adminReply && (
                  <div className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
                      <MessageSquare size={10} /> Admin Response
                    </p>
                    <p className="text-gray-700 text-sm">{review.adminReply}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => handleStatusChange(review.id, "Approved")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${review.status === "Approved"
                    ? "bg-green-100 text-green-700"
                    : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                    }`}>
                  <CheckCircle size={14} />
                  APPROVE
                </button>
                <button
                  onClick={() => handleStatusChange(review.id, "Rejected")}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${review.status === "Rejected"
                    ? "bg-red-100 text-red-700"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                    }`}>
                  <XCircle size={14} />
                  REJECT
                </button>
                <button
                  onClick={() => handleOpenReply(review)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Reply size={14} />
                  REPLY
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors ml-auto">
                  <Trash2 size={14} />
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                Respond to Review
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full transition-colors border border-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Review Content
                </p>
                <p className="text-gray-700 text-sm italic">
                  "{selectedReview.content}"
                </p>
              </div>

              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Your Response
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                    placeholder="Type your response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-bold">
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold flex items-center justify-center gap-2">
                    <Send size={18} />
                    POST RESPONSE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
