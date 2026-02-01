import React, { useEffect, useState } from "react";
import { Plus, Trash, ExternalLink, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import ImageUpload from "../../../components/ImageUpload";
import { API_ENDPOINTS } from "../../../config/api";

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        image: "",
        type: "main",
        link: "",
        isActive: true,
    });
    const [loading, setLoading] = useState(false);

    const fetchBanners = async () => {
        try {
            const { data } = await axios.get(
                API_ENDPOINTS.ADMIN_BANNERS,
                {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo")).token}`,
                    },
                },
            );
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners:", error);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(API_ENDPOINTS.ADMIN_BANNERS, formData, {
                headers: {
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo")).token}`,
                },
            });
            setShowModal(false);
            setFormData({ image: "", type: "main", link: "", isActive: true });
            fetchBanners();
        } catch (error) {
            alert("Error creating banner");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            try {
                await axios.delete(API_ENDPOINTS.ADMIN_BANNER_DETAIL(id), {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo")).token}`,
                    },
                });
                fetchBanners();
            } catch (error) {
                alert("Error deleting banner");
            }
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            await axios.put(
                API_ENDPOINTS.ADMIN_BANNER_DETAIL(banner._id),
                { isActive: !banner.isActive },
                {
                    headers: {
                        Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo")).token}`,
                    },
                },
            );
            fetchBanners();
        } catch (error) {
            alert("Error updating banner");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Banners</h1>
                    <p className="text-sm text-gray-400">Manage homepage banners</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus size={20} />
                    Add Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div
                        key={banner._id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="aspect-[3/1] bg-gray-100 relative overflow-hidden">
                            <img
                                src={banner.image}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button
                                    onClick={() => handleDelete(banner._id)}
                                    className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash size={18} />
                                </button>
                            </div>
                            <div className="absolute top-2 right-2">
                                <span
                                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${banner.isActive
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                        }`}>
                                    {banner.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {banner.type === "main" ? "Main Banner" : "Sub Banner"}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={banner.isActive}
                                        onChange={() => handleToggleActive(banner)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            {banner.link && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <ExternalLink size={14} />
                                    <span className="truncate">{banner.link}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-secondary">
                                Add New Banner
                            </h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Banner Type
                                    </label>
                                    <select
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData({ ...formData, type: e.target.value })
                                        }>
                                        <option value="main">Main Promotional Banner</option>
                                        <option value="sub">Sub / Search Banner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Image URL
                                    </label>
                                    <div className="relative">
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                            placeholder="Upload Banner Image"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Link URL (Optional)
                                    </label>
                                    <div className="relative">
                                        <ExternalLink
                                            className="absolute left-3 top-3 text-gray-400"
                                            size={20}
                                        />
                                        <input
                                            type="text"
                                            placeholder="/category/mobile-parts"
                                            className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                                            value={formData.link}
                                            onChange={(e) =>
                                                setFormData({ ...formData, link: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isActive: e.target.checked })
                                            }
                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Active immediately
                                        </span>
                                    </label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                                        {loading ? "Creating..." : "Create Banner"}
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

export default BannerManagement;
