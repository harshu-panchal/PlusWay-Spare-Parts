import React, { useState } from "react";
import {
  User,
  Mail,
  Smartphone,
  Lock,
  ShieldCheck,
  Bell,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { removeFCMToken } from "../../../services/pushNotificationService";

const Settings = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    email: userInfo?.email || "",
    mobile: userInfo?.mobile || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        API_ENDPOINTS.CUSTOMER_PROFILE,
        {
          name: formData.name,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update localStorage with new user info
      const updatedUserInfo = {
        ...userInfo,
        name: data.name,
        email: data.email,
        token: data.token,
      };
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Reload page after 1.5 seconds to reflect changes everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(API_ENDPOINTS.DELETE_ACCOUNT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      removeFCMToken();
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token");

      navigate("/login");
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete account. Please try again."
      );
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          ACCOUNT <span className="text-primary italic">SETTINGS</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Personal Information */}
            <form onSubmit={handleSubmit}>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                    Personal <span className="text-primary italic">Information</span>
                  </h2>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative group">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors"
                      />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors"
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Mobile Number
                    </label>
                    <div className="relative group">
                      <Smartphone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors"
                      />
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-secondary text-white text-[10px] font-black py-4 px-10 rounded-2xl uppercase tracking-[0.2em] shadow-lg transition-all ${loading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-black"
                      }`}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>

            {/* Security */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Security <span className="text-primary italic">Settings</span>
                </h2>
              </div>

              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-secondary uppercase tracking-wider">
                        Two-Step Verification
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Enabled on +91 {formData.mobile}
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-secondary group-hover:text-primary transition-colors">
                      <Bell size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-secondary uppercase tracking-wider">
                        Order Notifications
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Receive updates via SMS & Email
                      </p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Danger Zone / Delete Account */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-red-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                    Danger <span className="text-red-500 italic">Zone</span>
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Deactivate or soft delete your account
                  </p>
                </div>
              </div>

              <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-red-600 uppercase tracking-wider mb-1">
                    Delete Customer Account
                  </h3>
                  <p className="text-xs font-medium text-gray-600 max-w-md">
                    Deactivating your account will soft-delete your user profile and immediately log you out.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] py-3.5 px-6 rounded-xl uppercase tracking-[0.2em] shadow-md transition-all shrink-0 flex items-center gap-2">
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-secondary transition-colors">
              <X size={20} />
            </button>

            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <h3 className="text-xl font-black text-secondary uppercase italic tracking-tighter text-center mb-2">
              Delete Account?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 font-medium">
              Are you sure you want to delete your account? Your profile will be soft-deleted and you will be logged out immediately.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 text-center">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all">
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2">
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
