import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from "../../../config/api";
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

const HomeSectionManagement = () => {
    const [sections, setSections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        categories: [],
        isActive: true,
        order: 0,
        productsPerRow: 4,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sectionsRes, categoriesRes] = await Promise.all([
                axios.get(API_ENDPOINTS.ADMIN_HOME_SECTIONS, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                }),
                axios.get(`${API_BASE_URL}/api/customer/categories`), // Reusing public endpoint for ease
            ]);
            setSections(sectionsRes.data);
            setCategories(categoriesRes.data.filter(c => !c.parent)); // Only parent categories or all? Let's show all
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("adminToken");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingSection) {
                await axios.put(
                    API_ENDPOINTS.ADMIN_HOME_SECTION_DETAIL(editingSection._id),
                    formData,
                    config
                );
            } else {
                await axios.post(
                    API_ENDPOINTS.ADMIN_HOME_SECTIONS,
                    formData,
                    config
                );
            }

            setIsModalOpen(false);
            setEditingSection(null);
            setFormData({ title: "", categories: [], isActive: true, order: 0 });
            fetchData();
        } catch (error) {
            console.error("Error saving section:", error);
            alert(error.response?.data?.message || "Error saving section");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this section?")) {
            try {
                await axios.delete(API_ENDPOINTS.ADMIN_HOME_SECTION_DETAIL(id), {
                    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
                });
                fetchData();
            } catch (error) {
                console.error("Error deleting section:", error);
            }
        }
    };

    const openModal = (section = null) => {
        if (section) {
            setEditingSection(section);
            setFormData({
                title: section.title,
                categories: section.categories.map(c => c._id),
                isActive: section.isActive,
                order: section.order,
                productsPerRow: section.productsPerRow || 4,
            });
        } else {
            setEditingSection(null);
            setFormData({ title: "", categories: [], isActive: true, order: 0, productsPerRow: 4 });
        }
        setIsModalOpen(true);
    };

    const toggleCategory = (catId) => {
        setFormData(prev => {
            if (prev.categories.includes(catId)) {
                return { ...prev, categories: prev.categories.filter(id => id !== catId) };
            } else {
                return { ...prev, categories: [...prev.categories, catId] };
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Home Sections Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} /> Add New Section
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Categories</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Order</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sections.map((section) => (
                            <tr key={section._id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-medium text-gray-900">{section.title}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {section.categories.map((cat) => (
                                            <span key={cat._id} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {section.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{section.order}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(section)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(section._id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sections.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No home sections found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl m-4">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingSection ? "Edit Section" : "Create New Section"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="e.g. Spare Parts, Trending Now"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Order / Priority</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Products Per Row</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="2"
                                            max="8"
                                            value={formData.productsPerRow}
                                            onChange={(e) => setFormData({ ...formData, productsPerRow: parseInt(e.target.value) || 4 })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <span className="text-xs text-gray-500 whitespace-nowrap hidden sm:block">Default: 4</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Is Active?</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Categories</label>
                                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto p-4 bg-gray-50">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {categories.map((cat) => (
                                            <label key={cat._id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${formData.categories.includes(cat._id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.categories.includes(cat._id)}
                                                    onChange={() => toggleCategory(cat._id)}
                                                    className="rounded text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-xs font-medium text-gray-700 truncate" title={cat.name}>{cat.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Selected: {formData.categories.length} categories</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} /> Save Section
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeSectionManagement;
