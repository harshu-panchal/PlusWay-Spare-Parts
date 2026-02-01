import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronRight,
    X,
    Save,
} from "lucide-react";
import ImageUpload from "../../../components/ImageUpload";
import { API_BASE_URL } from "../../../config/api";

const BrandManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialBrandState = { name: "", logo: "" };

    const [formData, setFormData] = useState(initialBrandState);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("adminToken");
            const { data } = await axios.get(
                `${API_BASE_URL}/api/admin/brands`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            setItems(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch brands");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData(initialBrandState);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("adminToken");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            if (editingItem) {
                await axios.put(
                    `${API_BASE_URL}/api/admin/brands/${editingItem._id}`,
                    formData,
                    config,
                );
            } else {
                await axios.post(
                    `${API_BASE_URL}/api/admin/brands`,
                    formData,
                    config,
                );
            }
            fetchItems();
            handleCloseModal();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save brand");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this brand?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");
            await axios.delete(`${API_BASE_URL}/api/admin/brands/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchItems();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete brand");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Brand Management</h2>
                <div className="flex gap-4 items-center">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search brands..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                        <Plus size={18} />
                        <span>Add Brand</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg font-bold text-sm uppercase tracking-wider text-center">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Loading Brands...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items
                        .filter(
                            (item) =>
                                item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="h-40 bg-gray-50 relative flex items-center justify-center p-4">
                                    <img
                                        src={item.logo}
                                        alt={item.name}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2 bg-white text-gray-800 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-white text-gray-800 rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <p className="text-xs text-gray-500">
                                            ID: {item._id.substring(0, 8)}...
                                        </p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300" />
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">
                                {editingItem
                                    ? "Edit Brand"
                                    : "Add New Brand"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Samsung"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">
                                    Logo
                                </label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <ImageUpload
                                            value={formData.logo}
                                            onChange={(url) =>
                                                setFormData({
                                                    ...formData,
                                                    logo: url,
                                                })
                                            }
                                            placeholder="Upload Brand Logo"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-bold">
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold flex items-center justify-center gap-2">
                                    <Save size={18} />
                                    {editingItem ? "UPDATE" : "CREATE"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManagement;
