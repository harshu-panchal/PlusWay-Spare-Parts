import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import ImageUpload from "../../../components/ImageUpload";
import MultiImageUpload from "../../../components/MultiImageUpload";
import SortableImageGrid from "../../../components/SortableImageGrid";
import BulkUploadModal from "../../../components/BulkUploadModal";
import { API_ENDPOINTS } from "../../../config/api";
import Pagination from "../../../components/Pagination";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1);
  };

  const handleBrandFilterChange = (e) => {
    setBrandFilter(e.target.value);
    setPage(1);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };

      let queryParams = `?pageNumber=${page}`;
      if (searchTerm)
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      if (categoryFilter && categoryFilter !== "All")
        queryParams += `&category=${encodeURIComponent(categoryFilter)}`;
      if (brandFilter && brandFilter !== "All")
        queryParams += `&brand=${encodeURIComponent(brandFilter)}`;

      const [prodRes, catRes, brandRes, modelRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.ADMIN_PRODUCTS}${queryParams}`, config),
        axios.get(`${API_ENDPOINTS.ADMIN_CATEGORIES}?all=true`, config),
        axios.get(`${API_ENDPOINTS.ADMIN_BRANDS}?all=true`, config),
        axios.get(`${API_ENDPOINTS.ADMIN_MODELS}?all=true`, config),
      ]);

      const productData = prodRes.data;
      setProducts(productData.products || []);
      setPages(productData.pages || 1);
      setTotal(productData.total || 0);
      setCategories(catRes.data.categories || catRes.data || []);
      setBrands(brandRes.data.brands || brandRes.data || []);
      setModels(modelRes.data.models || modelRes.data || []);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchTerm, categoryFilter, brandFilter]);

  const initialFormState = {
    name: "",
    price: "",
    wholesalePrice: "",
    wholesaleMinQty: 10,
    category: "",
    brand: "",
    model: "",
    code: "",
    countInStock: 0,
    description: [""],
    images: [],
    videoUrl: "",
    colorVariants: [],
    colors: [],
    details: {
      specs: [],
      warranty: { summary: "", coveredInWarranty: "", serviceType: "", tnc: "" },
      inTheBox: "",
      highlights: [],
      descriptionPoints: [],
      countryOfOrigin: "",
      packer: "",
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
        description: Array.isArray(product.description) && product.description.length > 0 ? product.description : [product.description || ""],
        colorVariants: (product.colorVariants || []).map(v => ({
          colorName: v.colorName || "",
          sku: v.sku || "",
          price: v.price !== undefined ? v.price : "",
          mrp: v.mrp !== undefined ? v.mrp : "",
          wholesalePrice: v.wholesalePrice !== undefined ? v.wholesalePrice : "",
          wholesaleMinQty: v.wholesaleMinQty !== undefined ? v.wholesaleMinQty : "",
          countInStock: v.countInStock !== undefined ? v.countInStock : 0,
          images: v.images || [],
        })),
        colors: product.colors?.map((c) => ({ name: c })) || [],
        videoUrl: product.videoUrl || "",
        details: {
          specs: product.details?.specs || [],
          warranty: {
            period: "",
            policy: "",
            summary: "",
            ...(product.details?.warranty || {}),
          },
          inTheBox: product.details?.inTheBox || "",
          highlights:
            product.details?.highlights?.map((h) => ({ type: h })) || [],
          descriptionPoints:
            product.details?.descriptionPoints?.map((p) => ({ text: p })) || [],
          countryOfOrigin: product.details?.countryOfOrigin || "",
          packer: product.details?.packer || "",
        },
        countInStock: product.countInStock || 0,
        wholesalePrice: product.wholesalePrice || 0,
        wholesaleMinQty: product.wholesaleMinQty || 10,
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
  };

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

  const handleAddDescriptionPoint = () => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        descriptionPoints: [
          ...(formData.details.descriptionPoints || []),
          { text: "" },
        ],
      },
    });
  };

  const handleRemoveDescriptionPoint = (index) => {
    const newPoints = [...(formData.details.descriptionPoints || [])];
    newPoints.splice(index, 1);
    setFormData({
      ...formData,
      details: { ...formData.details, descriptionPoints: newPoints },
    });
  };

  const handleDescriptionPointChange = (index, value) => {
    const newPoints = [...(formData.details.descriptionPoints || [])];
    newPoints[index].text = value;
    setFormData({
      ...formData,
      details: { ...formData.details, descriptionPoints: newPoints },
    });
  };

  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [...(formData.colors || []), { name: "" }],
    });
  };

  const handleRemoveColor = (index) => {
    const newColors = [...(formData.colors || [])];
    newColors.splice(index, 1);
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const handleColorChange = (index, value) => {
    const newColors = [...(formData.colors || [])];
    newColors[index].name = value;
    setFormData({
      ...formData,
      colors: newColors,
    });
  };

  const handleAddParagraph = () => {
    setFormData({
      ...formData,
      description: [...(formData.description || []), ""],
    });
  };

  const handleRemoveParagraph = (index) => {
    const newDesc = [...(formData.description || [])];
    newDesc.splice(index, 1);
    setFormData({ ...formData, description: newDesc });
  };

  const handleParagraphChange = (index, value) => {
    const newDesc = [...(formData.description || [])];
    newDesc[index] = value;
    setFormData({ ...formData, description: newDesc });
  };

  const handleAddColorVariant = () => {
    setFormData({
      ...formData,
      colorVariants: [...(formData.colorVariants || []), {
        colorName: "",
        sku: "",
        price: "",
        mrp: "",
        wholesalePrice: "",
        wholesaleMinQty: "",
        countInStock: 0,
        images: [],
      }],
    });
  };

  const handleRemoveColorVariant = (index) => {
    const newVariants = [...(formData.colorVariants || [])];
    newVariants.splice(index, 1);
    setFormData({ ...formData, colorVariants: newVariants });
  };

  const handleColorVariantChange = (index, value) => {
    const newVariants = [...(formData.colorVariants || [])];
    newVariants[index].colorName = value;
    setFormData({ ...formData, colorVariants: newVariants });
  };

  const handleColorVariantFieldChange = (index, field, value) => {
    const newVariants = (formData.colorVariants || []).map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    setFormData({ ...formData, colorVariants: newVariants });
  };

  // NOTE: variants must be updated immutably down to the `images` array. A
  // shallow copy of `colorVariants` keeps the inner variant objects (and their
  // `images` arrays) referentially identical, so children that memoize on the
  // images-array reference (e.g. SortableImageGrid's `items` useMemo) skip
  // re-rendering. Each handler below therefore rebuilds the affected variant
  // and its `images` array with fresh references.
  const handleColorVariantImages = (index, urls) => {
    const newVariants = (formData.colorVariants || []).map((v, i) =>
      i === index
        ? { ...v, images: [...(v.images || []), ...urls] }
        : v,
    );
    setFormData({ ...formData, colorVariants: newVariants });
  };

  const handleRemoveColorVariantImage = (variantIndex, imageIndex) => {
    const newVariants = (formData.colorVariants || []).map((v, i) => {
      if (i !== variantIndex) return v;
      const nextImages = (v.images || []).filter((_, j) => j !== imageIndex);
      return { ...v, images: nextImages };
    });
    setFormData({ ...formData, colorVariants: newVariants });
  };

  const handleReorderColorVariantImages = (variantIndex, reorderedImages) => {
    const newVariants = (formData.colorVariants || []).map((v, i) =>
      i === variantIndex ? { ...v, images: reorderedImages } : v,
    );
    setFormData({ ...formData, colorVariants: newVariants });
  };

  const handleImageUpload = (urls, index = -1) => {
    if (index === -1) {
      // Add new multiple images
      setFormData({ ...formData, images: [...formData.images, ...urls] });
    } else {
      // Update existing image (optional, mostly we just add)
      const newImages = [...formData.images];
      // urls should be single string here if index is provided, but since MultiUpload returns array
      // we'll handle multiple addition only for now
      setFormData({ ...formData, images: [...formData.images, ...urls] });
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
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };

      const hasVariants = (formData.colorVariants || []).filter(c => c.colorName.trim() !== "").length > 0;

      // Validate: if no variants, price/mrp/stock/wholesale are required
      if (!hasVariants) {
        if (!formData.price || !formData.mrp || !formData.wholesalePrice) {
          alert("Please fill in Selling Price, MRP, and Wholesale Price.");
          return;
        }
      }

      // Ensure price/mrp are numbers
      const payload = {
        ...formData,
        // When variants exist, derive product-level price from first variant (for search/listing display)
        price: hasVariants
          ? Number(formData.colorVariants.find(v => v.colorName.trim())?.price ?? 0)
          : Number(formData.price),
        wholesalePrice: hasVariants
          ? Number(formData.colorVariants.find(v => v.colorName.trim())?.wholesalePrice ?? 0)
          : Number(formData.wholesalePrice),
        wholesaleMinQty: hasVariants
          ? Number(formData.colorVariants.find(v => v.colorName.trim())?.wholesaleMinQty ?? 10)
          : Number(formData.wholesaleMinQty),
        mrp: hasVariants
          ? Number(formData.colorVariants.find(v => v.colorName.trim())?.mrp ?? 0)
          : Number(formData.mrp),
        // Product-level stock = sum of all variant stocks when variants exist
        countInStock: hasVariants
          ? formData.colorVariants
              .filter(v => v.colorName.trim())
              .reduce((sum, v) => sum + (Number(v.countInStock) || 0), 0)
          : Number(formData.countInStock),
        description: formData.description.filter(p => p.trim() !== ""),
        colors: formData.colors?.map((c) => c.name).filter((c) => c) || [],
        colorVariants: (formData.colorVariants || [])
          .filter(c => c.colorName.trim() !== "")
          .map(v => ({
            colorName: v.colorName,
            sku: v.sku || undefined,
            price: v.price !== "" && v.price !== undefined ? Number(v.price) : undefined,
            mrp: v.mrp !== "" && v.mrp !== undefined ? Number(v.mrp) : undefined,
            wholesalePrice: v.wholesalePrice !== "" && v.wholesalePrice !== undefined ? Number(v.wholesalePrice) : undefined,
            wholesaleMinQty: v.wholesaleMinQty !== "" && v.wholesaleMinQty !== undefined ? Number(v.wholesaleMinQty) : undefined,
            countInStock: v.countInStock !== "" && v.countInStock !== undefined ? Number(v.countInStock) : 0,
            images: v.images || [],
          })),
        details: {
          ...formData.details,
          highlights:
            formData.details.highlights?.map((h) => h.type).filter((h) => h) ||
            [],
          descriptionPoints:
            formData.details.descriptionPoints
              ?.map((p) => p.text)
              .filter((p) => p) || [],
        },
      };

      if (editingProduct) {
        await axios.put(
          API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(editingProduct._id),
          payload,
          config,
        );
      } else {
        await axios.post(API_ENDPOINTS.ADMIN_PRODUCTS, payload, config);
      }
      setIsModalOpen(false);
      fetchData();
      alert("Product Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save product");
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };
      await axios.delete(
        API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(productToDelete._id),
        config,
      );
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchData();
      alert("Product Deleted Successfully");
    } catch (error) {
      console.error(error);
      alert(
        "Failed to delete product: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = products.map((p) => p._id);
      setSelectedProducts(allIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };
      await axios.delete(API_ENDPOINTS.ADMIN_PRODUCTS_BULK_DELETE, {
        ...config,
        data: { ids: selectedProducts },
      });
      setSelectedProducts([]);
      fetchData();
      alert("Products deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to bulk delete products");
    }
  };

  const handleExportBackup = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
        responseType: 'blob',
      };
      const response = await axios.get(API_ENDPOINTS.ADMIN_PRODUCTS_BACKUP, config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "plusway_products_backup.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Failed to export products backup");
    }
  };

  // Bulk-upload template columns.
  // For products WITHOUT color variants: fill SKU, price, mrp, wholesalePrice, wholesaleMinQty,
  // countInStock and leave colorVariants empty.
  // For products WITH color variants: fill colorVariants (carries its own SKU/price/stock) and
  // leave the top-level SKU/price/stock columns empty.
  const productTemplateColumns = [
    { header: "name *", key: "name", example: "LCD Screen Samsung S23 Ultra", example2: "Battery iPhone 14 Pro" },
    { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
    { header: "model *", key: "model", example: "Samsung Galaxy S23 Ultra", example2: "Apple iPhone 14 Pro" },
    { header: "category *", key: "category", example: "LCD Display", example2: "Battery" },
    { header: "SKU", key: "SKU", example: "", example2: "PW-BAT-IP14P-001" },
    { header: "price", key: "price", example: "", example2: 2500 },
    { header: "mrp", key: "mrp", example: "", example2: 3000 },
    { header: "wholesalePrice", key: "wholesalePrice", example: "", example2: 2100 },
    { header: "wholesaleMinQty", key: "wholesaleMinQty", example: "", example2: 10 },
    { header: "countInStock", key: "countInStock", example: "", example2: 50 },
    { header: "colorVariants", key: "colorVariants", example: "Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg,http://img2.jpg||White;PW-WHI-002;4700;5500;3900;10;20;http://img3.jpg", example2: "" },
    { header: "description", key: "description", example: "High quality original LCD display", example2: "Long lasting battery" },
    { header: "images", key: "images", example: "http://server/uploads/img1.jpg|http://server/uploads/img2.jpg", example2: "" },
    { header: "videoUrl", key: "videoUrl", example: "", example2: "" },
    { header: "specs", key: "specs", example: "Color:Black|Compatibility:S23 Ultra|Type:AMOLED", example2: "Capacity:3000mAh|Voltage:3.8V" },
    { header: "inTheBox", key: "inTheBox", example: "LCD Display, Installation Guide", example2: "Battery" },
    { header: "warrantySummary", key: "warrantySummary", example: "10 Days Testing Replacement Warranty", example2: "" },
    { header: "coveredInWarranty", key: "coveredInWarranty", example: "Yes, Replacement Only. No Returns", example2: "" },
    { header: "warrantyServiceType", key: "warrantyServiceType", example: "Send to seller by courier", example2: "" },
    { header: "warrantyTnC", key: "warrantyTnC", example: "Warranty Terms", example2: "" },
    { header: "countryOfOrigin", key: "countryOfOrigin", example: "China", example2: "India" },
    { header: "packer", key: "packer", example: "Elcotek India Pvt Ltd, New Delhi", example2: "" },
    { header: "highlights", key: "highlights", example: "Super AMOLED|Fast Charging|5G Ready", example2: "Long Life|Safe Chemistry" },
    { header: "descriptionPoints", key: "descriptionPoints", example: "100% Original Part|Quality Tested", example2: "Safe and reliable" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        {/* Left: Search & Filters */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="flex-1 md:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-gray-600 bg-gray-50 text-sm font-medium"
              value={brandFilter}
              onChange={handleBrandFilterChange}>
              <option value="All">All Brands</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <select
              className="flex-1 md:flex-none px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all text-gray-600 bg-gray-50 text-sm font-medium"
              value={categoryFilter}
              onChange={handleCategoryFilterChange}>
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-sm"
            title="Download a full backup in the bulk-upload format. If the catalog is wiped, restore everything via Admin → Products → Bulk (Upload).">
            <Save size={14} className="text-gray-500" />
            <span className="hidden lg:inline">Export</span>
          </button>
          <button
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-sm"
            title="Bulk Price Update">
            <Upload size={14} className="text-purple-600" />
            <span className="hidden lg:inline">Prices</span>
          </button>
          <button
            onClick={() => setIsBulkUpdateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-sm"
            title="Bulk Update Products by SKU (any field)">
            <Edit size={14} className="text-amber-600" />
            <span className="hidden lg:inline">Update</span>
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-sm"
            title="Bulk Upload Products">
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span className="hidden lg:inline">Bulk</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 active:scale-95 text-xs font-bold ml-1">
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Info Banner & Selected Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between text-sm gap-3">
        <div className="flex items-center gap-2 text-gray-600 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100/50 w-full md:max-w-2xl">
          <span className="font-bold text-[10px] text-blue-700 uppercase tracking-wider bg-blue-100 px-1.5 py-0.5 rounded">Tip</span> 
          <span className="text-xs text-blue-800">Need column keys or examples for bulk upload? Click the <strong>Bulk</strong> button and download the template.</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-xs font-bold border border-red-100">
              <Trash2 size={14} />
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          <span className="text-gray-400 text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-100">
            Total: {total} items
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={products.length > 0 && selectedProducts.length === products.length}
                  />
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Retail
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Wholesale
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">
                  Stock Status
                </th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelectProduct(product._id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0 group-hover:border-blue-200 transition-colors">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : product.image ||
                                "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0 max-w-[200px] md:max-w-[300px]">
                        <p className="font-bold text-gray-900 text-[13px] truncate group-hover:text-blue-600 transition-colors" title={product.name}>
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-wider">
                          SKU: {product.code || product._id.toString().slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-50 border border-gray-200 text-gray-700">
                      {product.category?.name ||
                        categories.find((c) => c._id === product.category)
                          ?.name ||
                        "Display"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">
                        ₹{product.price?.toLocaleString()}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{product.mrp?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-black text-blue-600 text-sm">
                        ₹{product.wholesalePrice?.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        Min Qty: {product.wholesaleMinQty || 10}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          product.countInStock > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                        {product.countInStock > 0 ? `${product.countInStock} In Stock` : "Out of Stock"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/${product._id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit Product">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Product">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
          <Pagination
            page={page}
            pages={pages}
            onPageChange={(p) => setPage(p)}
          />
          <p className="text-center text-xs text-gray-400 mt-4">
            Total {total} products found
          </p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white w-full h-full overflow-hidden flex flex-col shadow-2xl">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
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
                className="p-2 bg-gray-50 hover:bg-gray-100 hover:shadow-sm rounded-xl transition-all text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form
                onSubmit={handleSubmit}
                className="p-8 space-y-8 max-w-6xl mx-auto w-full">
              {/* Product Gallery Section */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    Product Gallery
                  </label>
                  {formData.images.length > 1 && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Drag thumbnails to reorder · first image is the primary
                    </span>
                  )}
                </div>
                <SortableImageGrid
                  images={formData.images}
                  onReorder={(reordered) =>
                    setFormData((prev) => ({ ...prev, images: reordered }))
                  }
                  onRemove={handleRemoveImage}
                  altPrefix="Product"
                  uploadSlot={
                    <MultiImageUpload
                      onUpload={(urls) => handleImageUpload(urls)}
                      placeholder="Add Images"
                    />
                  }
                />
              </div>

              {/* Color Variants */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    Color Variants
                  </label>
                  <button
                    type="button"
                    onClick={handleAddColorVariant}
                    className="text-blue-600 text-xs font-bold hover:underline">
                    + Add Color Variant
                  </button>
                </div>
                <p className="text-xs text-gray-400">Each variant can have its own price, stock, SKU and images. Leave pricing blank to inherit product-level pricing.</p>
                <div className="space-y-5">
                  {formData.colorVariants?.map((variant, index) => (
                    <div key={index} className="p-4 border border-blue-100 rounded-xl bg-blue-50/30 space-y-4">
                      {/* Row 1: Color name + SKU + remove */}
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Color Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Midnight Black"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400"
                            value={variant.colorName}
                            onChange={(e) => handleColorVariantChange(index, e.target.value)}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SKU</label>
                          <input
                            type="text"
                            placeholder="Auto-generated on save"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
                            value={variant.sku || ""}
                            onChange={(e) => handleColorVariantFieldChange(index, "sku", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveColorVariant(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors mt-5">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Row 2: Price, MRP, Stock */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="Inherit"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400"
                              value={variant.price ?? ""}
                              onChange={(e) => handleColorVariantFieldChange(index, "price", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">MRP (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="Inherit"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                              value={variant.mrp ?? ""}
                              onChange={(e) => handleColorVariantFieldChange(index, "mrp", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Stock</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400"
                            value={variant.countInStock ?? 0}
                            onChange={(e) => handleColorVariantFieldChange(index, "countInStock", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Row 3: Wholesale Price, Wholesale Min Qty */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wholesale Price (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="Inherit"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 focus:outline-none focus:border-blue-400"
                              value={variant.wholesalePrice ?? ""}
                              onChange={(e) => handleColorVariantFieldChange(index, "wholesalePrice", e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wholesale Min Qty</label>
                          <input
                            type="number"
                            min="1"
                            placeholder="Inherit"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400"
                            value={variant.wholesaleMinQty ?? ""}
                            onChange={(e) => handleColorVariantFieldChange(index, "wholesaleMinQty", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Row 4: Variant Images */}
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-3">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Variant Images</label>
                          {(variant.images?.length || 0) > 1 && (
                            <span className="text-[10px] text-gray-400">Drag to reorder</span>
                          )}
                        </div>
                        <SortableImageGrid
                          images={variant.images || []}
                          onReorder={(reordered) =>
                            handleReorderColorVariantImages(index, reordered)
                          }
                          onRemove={(imgIndex) =>
                            handleRemoveColorVariantImage(index, imgIndex)
                          }
                          gridClassName="grid grid-cols-3 md:grid-cols-5 gap-3"
                          thumbnailClassName="bg-white"
                          removeIconSize={12}
                          RemoveIcon={X}
                          altPrefix={variant.colorName || "Variant"}
                          uploadSlot={
                            <MultiImageUpload
                              onUpload={(urls) => handleColorVariantImages(index, urls)}
                              placeholder="Images"
                            />
                          }
                        />
                      </div>
                    </div>
                  ))}
                  {(!formData.colorVariants || formData.colorVariants.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No color variants added.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  {/* SKU — only shown when no color variants (variants carry their own SKU) */}
                  {(formData.colorVariants?.length ?? 0) === 0 && (
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                        SKU
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={formData.code || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        placeholder={editingProduct ? "e.g. PW-123456" : "Auto-generated on save"}
                        disabled={!editingProduct}
                      />
                    </div>
                  )}
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
                        .filter(
                          (m) =>
                            !formData.brand ||
                            (m.brand?._id || m.brand) === formData.brand,
                        )
                        .map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* ── Pricing / Stock / SKU — only shown when NO color variants ── */}
                {(formData.colorVariants?.length ?? 0) === 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                          Selling Price (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            required
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                          MRP (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            required
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-500"
                            value={formData.mrp}
                            onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                          Stock Count *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          placeholder="0"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                          value={formData.countInStock}
                          onChange={(e) => setFormData({ ...formData, countInStock: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                          Wholesale Price (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            required
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-blue-600"
                            value={formData.wholesalePrice}
                            onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                            placeholder="Price for bulk orders"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                          Wholesale Min Quantity *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                          value={formData.wholesaleMinQty}
                          onChange={(e) => setFormData({ ...formData, wholesaleMinQty: e.target.value })}
                          placeholder="Min qty for wholesale price"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-blue-500 mt-0.5">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-blue-800">Pricing & stock managed per color variant</p>
                      <p className="text-xs text-blue-600 mt-0.5">Each color variant above carries its own price, MRP, wholesale price, stock count, and SKU. Product-level fields are not needed.</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Description Paragraphs
                    </label>
                    <button
                      type="button"
                      onClick={handleAddParagraph}
                      className="text-blue-600 text-xs font-bold hover:underline">
                      + Add Paragraph
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.description?.map((para, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none text-sm"
                          value={para}
                          onChange={(e) =>
                            handleParagraphChange(index, e.target.value)
                          }
                          placeholder={`Paragraph ${index + 1}...`}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded h-fit mt-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {(!formData.description || formData.description.length === 0) && (
                      <p className="text-xs text-gray-400 italic">No description paragraphs added.</p>
                    )}
                  </div>
                </div>

                {/* Description Points */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Description Points
                    </label>
                    <button
                      type="button"
                      onClick={handleAddDescriptionPoint}
                      className="text-blue-600 text-xs font-bold hover:underline">
                      + Add Description Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.details.descriptionPoints?.map((point, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Description point (e.g. High quality product)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={point.text}
                          onChange={(e) =>
                            handleDescriptionPointChange(index, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDescriptionPoint(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Specifications
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="text-blue-600 text-xs font-bold hover:underline">
                      + Add Specification
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.details.specs?.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Key (e.g. Color)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={spec.key}
                          onChange={(e) =>
                            handleSpecChange(index, "key", e.target.value)
                          }
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. Black)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecChange(index, "value", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {(!formData.details.specs ||
                      formData.details.specs.length === 0) && (
                      <p className="text-xs text-gray-400 italic">
                        No specifications added.
                      </p>
                    )}
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Highlights
                    </label>
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="text-blue-600 text-xs font-bold hover:underline">
                      + Add Highlight
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.details.highlights?.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Highlight (e.g. Super AMOLED Display)"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                          value={highlight.type}
                          onChange={(e) =>
                            handleHighlightChange(index, e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded">
                          <Trash2 size={16} />
                        </button>
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
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          inTheBox: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Handset, Charger, Cable"
                  />
                </div>

                {/* Warranty & General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Covered in Warranty
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty?.coveredInWarranty || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            warranty: {
                              ...formData.details.warranty,
                              coveredInWarranty: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Yes, Replacement Only. No Returns"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Warranty Service Type
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty?.serviceType || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            warranty: {
                              ...formData.details.warranty,
                              serviceType: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Send to seller by courier"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Warranty Summary
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty?.summary || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            warranty: {
                              ...formData.details.warranty,
                              summary: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 10 Days Testing Replacement Warranty"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Warranty T&C
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.warranty?.tnc || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            warranty: {
                              ...formData.details.warranty,
                              tnc: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Warranty Terms"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.countryOfOrigin || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            countryOfOrigin: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. China"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                      Packer
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.details.packer || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          details: {
                            ...formData.details,
                            packer: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Elcotek India Pvt Ltd, New Delhi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={formData.videoUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
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
                        setFormData({
                          ...formData,
                          countInStock: e.target.checked ? 100 : 0,
                        })
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Product?
              </h3>
              <p className="text-gray-500 mb-8 px-4">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-900">
                  "{productToDelete?.name}"
                </span>
                ? This action cannot be undone and will remove the product from
                all categories.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm">
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 font-bold text-sm flex items-center justify-center gap-2">
                  <Trash2 size={18} />
                  DELETE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => { fetchData(); setIsBulkModalOpen(false); }}
        uploadEndpoint={API_ENDPOINTS.ADMIN_PRODUCTS_BULK_UPLOAD}
        templateColumns={productTemplateColumns}
        templateSheetName="Products"
        templateFileName="plusway_products_bulk_template.xlsx"
        title="Bulk Upload Products"
        description="Upload multiple products at once via Excel spreadsheet"
      />

      {/* Bulk Price Update Modal */}
      <BulkUploadModal
        isOpen={isBulkPriceModalOpen}
        onClose={() => setIsBulkPriceModalOpen(false)}
        onSuccess={() => { fetchData(); setIsBulkPriceModalOpen(false); }}
        uploadEndpoint={API_ENDPOINTS.ADMIN_PRODUCTS_BULK_PRICE_UPDATE}
        templateColumns={[
          { header: "SKU *", key: "SKU", example: "PW-123456", example2: "PW-654321" },
          { header: "Price *", key: "Price", example: "500", example2: "1500" },
          { header: "MRP", key: "MRP", example: "600", example2: "1800" },
          { header: "WholesalePrice", key: "WholesalePrice", example: "450", example2: "1350" },
          { header: "WholesaleMinQty", key: "WholesaleMinQty", example: "10", example2: "5" }
        ]}
        templateSheetName="Bulk Price Update"
        templateFileName="plusway_bulk_price_update.xlsx"
        title="Bulk Update Prices"
        description="Update prices for multiple products using their SKUs"
      />

      {/* Bulk Update Products (any field) Modal — SKU-keyed, supports color variants */}
      <BulkUploadModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        onSuccess={() => { fetchData(); setIsBulkUpdateModalOpen(false); }}
        uploadEndpoint={API_ENDPOINTS.ADMIN_PRODUCTS_BULK_UPDATE}
        templateEndpoint={API_ENDPOINTS.ADMIN_PRODUCTS_BULK_UPDATE_TEMPLATE}
        templateColumns={[
          { header: "SKU *", key: "SKU", example: "PW-BLA-001", example2: "PW-BAT-IP14P-001" },
          { header: "colorName", key: "colorName", example: "Black", example2: "" },
          { header: "price", key: "price", example: 4500, example2: 2500 },
          { header: "mrp", key: "mrp", example: 5500, example2: 3000 },
          { header: "wholesalePrice", key: "wholesalePrice", example: 3800, example2: 2100 },
          { header: "wholesaleMinQty", key: "wholesaleMinQty", example: 10, example2: 10 },
          { header: "countInStock", key: "countInStock", example: 50, example2: 50 },
          { header: "images", key: "images", example: "http://server/uploads/img1.jpg,http://server/uploads/img2.jpg", example2: "" },
          { header: "name", key: "name", example: "", example2: "Battery iPhone 14 Pro" },
          { header: "description", key: "description", example: "", example2: "Long lasting battery" },
          { header: "cashback", key: "cashback", example: "", example2: 50 },
          { header: "brand", key: "brand", example: "", example2: "Apple" },
          { header: "model", key: "model", example: "", example2: "Apple iPhone 14 Pro" },
          { header: "category", key: "category", example: "", example2: "Battery" },
          { header: "productType", key: "productType", example: "", example2: "Battery" },
          { header: "videoUrl", key: "videoUrl", example: "", example2: "" },
          { header: "specs", key: "specs", example: "", example2: "Capacity:3000mAh|Voltage:3.8V" },
          { header: "inTheBox", key: "inTheBox", example: "", example2: "Battery" },
          { header: "warrantyPeriod", key: "warrantyPeriod", example: "", example2: "30 Days" },
          { header: "warrantyPolicy", key: "warrantyPolicy", example: "", example2: "Replacement" },
          { header: "warrantySummary", key: "warrantySummary", example: "", example2: "10 Days Testing Replacement Warranty" },
          { header: "coveredInWarranty", key: "coveredInWarranty", example: "", example2: "Yes, Replacement Only" },
          { header: "warrantyServiceType", key: "warrantyServiceType", example: "", example2: "Send to seller by courier" },
          { header: "warrantyTnC", key: "warrantyTnC", example: "", example2: "Warranty Terms" },
          { header: "highlights", key: "highlights", example: "", example2: "Long Life|Safe Chemistry" },
          { header: "descriptionPoints", key: "descriptionPoints", example: "", example2: "Safe and reliable" },
          { header: "countryOfOrigin", key: "countryOfOrigin", example: "", example2: "India" },
          { header: "packer", key: "packer", example: "", example2: "Elcotek India Pvt Ltd, New Delhi" },
          { header: "colors", key: "colors", example: "", example2: "Black,White" },
        ]}
        templateSheetName="Bulk Update Products"
        templateFileName="plusway_bulk_update_products.xlsx"
        title="Bulk Update Products"
        description="Update any product information by SKU. Color variants supported via their own SKU."
      />
    </div>
  );
};

export default ProductManagement;
