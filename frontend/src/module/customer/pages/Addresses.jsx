import React, { useState, useEffect } from "react";
import { MapPin, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import ProfileSidebar from "../components/ProfileSidebar";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    type: "Home",
    name: "",
    mobile: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(API_ENDPOINTS.ADDRESSES, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const resetForm = () => {
    setFormData({
      type: "Home",
      name: "",
      mobile: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      if (editingId) {
        // Update existing address
        await axios.put(
          API_ENDPOINTS.ADDRESS_DETAIL(editingId),
          formData,
          {
            headers: { Authorization: `Bearer ${userInfo?.token}` },
          }
        );
        setMessage({ type: "success", text: "Address updated successfully!" });
      } else {
        // Add new address
        await axios.post(API_ENDPOINTS.ADDRESSES, formData, {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        });
        setMessage({ type: "success", text: "Address added successfully!" });
      }

      fetchAddresses();
      resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save address",
      });
    }
  };

  const handleEdit = (address) => {
    setFormData({
      type: address.type,
      name: address.name,
      mobile: address.mobile,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await axios.delete(API_ENDPOINTS.ADDRESS_DETAIL(id), {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      setMessage({ type: "success", text: "Address deleted successfully!" });
      fetchAddresses();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete address",
      });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axios.put(
        API_ENDPOINTS.ADDRESS_DEFAULT(id),
        {},
        {
          headers: { Authorization: `Bearer ${userInfo?.token}` },
        }
      );
      fetchAddresses();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to set default address",
      });
    }
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          MY <span className="text-primary italic">ADDRESSES</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Saved <span className="text-primary italic">Addresses</span>
                </h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-primary text-white text-[10px] font-black py-3 px-6 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-secondary transition-all"
                >
                  <Plus size={16} />
                  Add New
                </button>
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

              {loading ? (
                <div className="text-center py-12 text-gray-400">Loading addresses...</div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-bold uppercase text-sm">No addresses saved yet</p>
                  <p className="text-gray-300 text-xs mt-2">Click "Add New" to add your first address</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`relative p-6 rounded-2xl border transition-all ${address.isDefault
                          ? "border-primary bg-orange-50/30"
                          : "border-gray-100 hover:border-gray-200"
                        }`}
                    >
                      {address.isDefault && (
                        <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-sm">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                          <MapPin size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                            {address.type}
                          </span>
                          <p className="text-sm font-black text-secondary uppercase tracking-wider">
                            {address.name}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1 mb-6">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {address.street}
                        </p>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-xs font-black text-secondary uppercase tracking-widest pt-2">
                          +91 {address.mobile}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefault(address._id)}
                            className="flex-1 py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary transition-all"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary transition-all"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
                          className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                {editingId ? "Edit" : "Add"} <span className="text-primary italic">Address</span>
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-secondary transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Address Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-bold text-secondary uppercase tracking-wide cursor-pointer"
                >
                  Set as default address
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-black rounded-xl uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-secondary text-white font-black rounded-xl uppercase tracking-widest hover:bg-black transition-all"
                >
                  {editingId ? "Update" : "Add"} Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
