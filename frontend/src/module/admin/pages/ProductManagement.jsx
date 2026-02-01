import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Upload,
  Save,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import ImageUpload from "../../../components/ImageUpload";
import { API_ENDPOINTS } from "../../../config/api";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}` } };

      const [prodRes, catRes, brandRes, modelRes] = await Promise.all([
        axios.get(API_ENDPOINTS.ADMIN_PRODUCTS, config),
        axios.get(API_ENDPOINTS.ADMIN_CATEGORIES, config),
        axios.get(API_ENDPOINTS.ADMIN_BRANDS, config),
        axios.get(API_ENDPOINTS.ADMIN_MODELS, config)
      ]);

      setProducts(prodRes.data.products || prodRes.data || []); // Handle paginated response
      setCategories(catRes.data);
      setBrands(brandRes.data);
      setModels(modelRes.data);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.toString().includes(searchTerm);
    const matchesCategory =
      categoryFilter === "All" ||
      product.category?._id === categoryFilter || product.category === categoryFilter; // Handle populated vs unpopulated
    return matchesSearch && matchesCategory;
  });

  const initialFormState = {
    name: "",
    price: "",
    mrp: "",
    category: "",
    brand: "",
    model: "",
    code: "",
    countInStock: 0,
    description: "",
    images: [],
    details: {
      specs: [],
      warranty: { period: "", policy: "", summary: "" },
      inTheBox: "",
      highlights: [],
    },
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        model: product.model?._id || product.model || "",
        details: {
          specs: product.details?.specs || [],
          warranty: {
            period: "",
            policy: "",
            summary: "",
            ...(product.details?.warranty || {})
          },
          inTheBox: product.details?.inTheBox || "",
          highlights: product.details?.highlights?.map(h => ({ type: h })) || []
        },
        countInStock: product.countInStock || 0,
      });
    } else {
      setEditingProduct(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleAddSpec = () => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        specs: [...(formData.details.specs || []), { key: "", value: "" }],
      },
    });
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = [...(formData.details.specs || [])];
    newSpecs.splice(index, 1);
    setFormData({
      ...formData,
      details: { ...formData.details, specs: newSpecs },
    });
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...(formData.details.specs || [])];
    newSpecs[index][field] = value;
    setFormData({
      ...formData,
      details: { ...formData.details, specs: newSpecs },
    });
  };

  const handleAddHighlight = () => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        highlights: [...(formData.details.highlights || []), { type: "" }],
      },
    });
  }

  const handleRemoveHighlight = (index) => {
    const newHighlights = [...(formData.details.highlights || [])];
    newHighlights.splice(index, 1);
    setFormData({
      ...formData,
      details: { ...formData.details, highlights: newHighlights },
    });
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...(formData.details.highlights || [])];
    newHighlights[index].type = value;
    setFormData({
      ...formData,
      details: { ...formData.details, highlights: newHighlights },
    });
  };

  const handleImageUpload = (url, index = -1) => {
    if (index === -1) {
      // Add new image
      setFormData({ ...formData, images: [...formData.images, url] });
    } else {
      // Update existing image (optional, mostly we just add)
      const newImages = [...formData.images];
      newImages[index] = url;
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken"); // Assuming token storage
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}` } };

      // Ensure price/mrp are numbers
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        countInStock: Number(formData.countInStock),
        details: {
          ...formData.details,
          highlights: formData.details.highlights?.map(h => h.type).filter(h => h) || []
        }
      };

      if (editingProduct) {
        await axios.put(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(editingProduct._id), payload, config);
      } else {
        await axios.post(API_ENDPOINTS.ADMIN_PRODUCTS, payload, config);
      }
      setIsModalOpen(false);
      // Refresh products (need to lift state or fetch here)
      alert("Product Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            Manage your product inventory and details
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-600 bg-white font-medium text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus size={18} />
            <span className="font-medium">Add Product</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, ID or SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Showing {filteredProducts.length} products</span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  Stock Status
                </th>
                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 bg-white p-1 flex-shrink-0 group-hover:border-blue-200 transition-colors">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : (product.image || "https://via.placeholder.com/150")}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[12px] text-gray-400 font-medium">
                          SKU: {product._id.toString().slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category?.name || categories.find((c) => c._id === product.category)?.name || "Display"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-gray-400 line-through">
                        ₹{product.mrp.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${product.countInStock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}>
                        {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                      {product.countInStock > 0 && (
                        <span className="text-[10px] text-gray-400 font-medium italic">
                          Ready to ship
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Product">
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Product">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">1</span> to{" "}
            <span className="font-medium text-gray-900">{products.length}</span>{" "}
            of{" "}
            <span className="font-medium text-gray-900">{products.length}</span>{" "}
            results
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled>
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm">
                1
              </button>
            </div>
            <button
              className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingProduct
                    ? "Update existing product information"
                    : "Add a new product to your inventory"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-8 overflow-y-auto space-y-8">
              {/* Product Gallery Section */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                  Product Gallery
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200">
                        <img src={img} alt={`Product ${index}`} className="w-full h-full object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <ImageUpload
                      value={""}
                      onChange={(url) => handleImageUpload(url)}
                      placeholder="Add Image"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. LCD Screen for Samsung S23 Ultra"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }>
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Brand
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }>
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Model
                    </label>
                    <select
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }>
                      <option value="">Select Model</option>
                      {models
                        .filter((m) => !formData.brand || (m.brand?._id || m.brand) === formData.brand)
                        .map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Selling Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      MRP (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-500"
                        value={formData.mrp}
                        onChange={(e) =>
                          setFormData({ ...formData, mrp: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-32 resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter detailed product description..."
                  />
                </div>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Specifications</label>
                    <button type="button" onClick={handleAddSpec} className="text-blue-600 text-xs font-bold hover:underline">+ Add Specification</button>
                  </div>
                  <div className="space-y-2">
                    {formData.details.specs?.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Key (e.g. Color)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={spec.key}
                          onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Black)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        />
                        <button type="button" onClick={() => handleRemoveSpec(index)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {(!formData.details.specs || formData.details.specs.length === 0) && (
                      <p className="text-xs text-gray-400 italic">No specifications added.</p>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Highlights</label>
                    <button type="button" onClick={handleAddHighlight} className="text-blue-600 text-xs font-bold hover:underline">+ Add Highlight</button>
                  </div>
                  <div className="space-y-2">
                    {formData.details.highlights?.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Highlight (e.g. Super AMOLED Display)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={highlight.type}
                          onChange={(e) => handleHighlightChange(index, e.target.value)}
                        />
                        <button type="button" onClick={() => handleRemoveHighlight(index)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In The Box */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    In The Box
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.details.inTheBox}
                    onChange={(e) =>
                      setFormData({ ...formData, details: { ...formData.details, inTheBox: e.target.value } })
                    }
                    placeholder="e.g. Handset, Charger, Cable"
                  />
                </div>

                {/* Warranty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Warranty Period</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty.period}
                      onChange={(e) =>
                        setFormData({ ...formData, details: { ...formData.details, warranty: { ...formData.details.warranty, period: e.target.value } } })
                      }
                      placeholder="e.g. 6 Months"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Warranty Policy</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty.policy}
                      onChange={(e) =>
                        setFormData({ ...formData, details: { ...formData.details, warranty: { ...formData.details.warranty, policy: e.target.value } } })
                      }
                      placeholder="e.g. Replacement"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">Warranty Summary</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl h-20 resize-none"
                    value={formData.details.warranty.summary}
                    onChange={(e) =>
                      setFormData({ ...formData, details: { ...formData.details, warranty: { ...formData.details.warranty, summary: e.target.value } } })
                    }
                    placeholder="e.g. Warranty covers manufacturing defects only..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">
                      Stock Availability
                    </span>
                    <span className="text-xs text-gray-500">
                      Toggle if the product is currently in stock
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.countInStock > 0}
                      onChange={(e) =>
                        setFormData({ ...formData, countInStock: e.target.checked ? 100 : 0 })
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm tracking-wide">
                  DISCARD
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                  <Save size={18} />
                  {editingProduct ? "SAVE CHANGES" : "CREATE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};

export default ProductManagement;
