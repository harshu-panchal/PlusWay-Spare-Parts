import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Smartphone,
  ChevronRight,
  Filter,
  X,
  Save,
  FileSpreadsheet,
} from "lucide-react";
import ImageUpload from "../../../components/ImageUpload";
import BulkUploadModal from "../../../components/BulkUploadModal";
import { API_ENDPOINTS } from "../../../config/api";
import Pagination from "../../../components/Pagination";
import {
  formatReleasedDate,
  releasedToYearMonth,
} from "../../../utils/formatReleasedDate";

const ModelManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const [models, setModels] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);

  const initialFormState = {
    name: "",
    brand: "",
    released: "",
    image: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleBrandFilterChange = (e) => {
    setSelectedBrand(e.target.value);
    setPage(1);
  };

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
      if (selectedBrand)
        queryParams += `&brand=${encodeURIComponent(selectedBrand)}`;

      const [modelRes, brandRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.ADMIN_MODELS}${queryParams}`, config),
        axios.get(`${API_ENDPOINTS.ADMIN_BRANDS}?all=true`, config),
      ]);
      setModels(modelRes.data.models);
      setPages(modelRes.data.pages);
      setTotal(modelRes.data.total);
      setBrands(brandRes.data.brands || brandRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSelectedModels([]);
  }, [page, searchTerm, selectedBrand]);

  const handleOpenModal = (model = null) => {
    if (model) {
      setEditingModel(model);
      setFormData({
        name: model.name,
        brand: model.brand?._id || model.brand,
        released: model.released || "",
        image: model.image || "",
      });
    } else {
      setEditingModel(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
  };

  const handleImageUpload = (url) => {
    setFormData({ ...formData, image: url });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };
      if (editingModel) {
        await axios.put(
          API_ENDPOINTS.ADMIN_MODEL_DETAIL(editingModel._id),
          formData,
          config,
        );
      } else {
        await axios.post(API_ENDPOINTS.ADMIN_MODELS, formData, config);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving model:", error);
      alert("Failed to save model");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };
      await axios.delete(API_ENDPOINTS.ADMIN_MODEL_DETAIL(id), config);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete model");
    }
  };

  const handleSelectModel = (id) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedModels(models.map((m) => m._id));
    } else {
      setSelectedModels([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedModels.length === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedModels.length} model(s)? This cannot be undone.`,
      )
    )
      return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
        data: { ids: selectedModels },
      };
      await axios.delete(API_ENDPOINTS.ADMIN_MODELS_BULK_DELETE, config);
      setSelectedModels([]);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message || "Failed to bulk delete models",
      );
    }
  };

  const modelTemplateColumns = [
    { header: "name *", key: "name", example: "Galaxy S23 Ultra", example2: "iPhone 14 Pro" },
    { header: "brand *", key: "brand", example: "Samsung", example2: "Apple" },
    { header: "released", key: "released", example: "15/02/2023", example2: "28/09/2022" },
    { header: "image", key: "image", example: "http://server/uploads/s23ultra.jpg", example2: "" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Models</h1>
            <p className="text-sm text-gray-500">
              Manage your device models and details
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg border border-blue-100 max-w-lg">
            <span className="font-bold">Bulk Upload Tip:</span> To view the <strong>Complete Field Reference</strong> (required fields, exact column keys, and examples), click the <strong>Bulk Upload</strong> button and download the template.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
            <FileSpreadsheet size={18} />
            <span className="font-medium">Bulk Upload</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={18} />
            <span className="font-medium">Add Model</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search models..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={selectedBrand}
            onChange={handleBrandFilterChange}>
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedModels.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-red-700">
            {selectedModels.length} model{selectedModels.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedModels([])}
              className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-white rounded-lg transition-colors">
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
              <Trash2 size={14} />
              Delete Selected ({selectedModels.length})
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={
                      models.length > 0 &&
                      selectedModels.length === models.length
                    }
                    aria-label="Select all models on this page"
                  />
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Model Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Brand
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Details
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {models.map((model) => (
                <tr
                  key={model._id}
                  className={`hover:bg-gray-50 transition-colors ${selectedModels.includes(model._id) ? "bg-blue-50/40" : ""}`}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      checked={selectedModels.includes(model._id)}
                      onChange={() => handleSelectModel(model._id)}
                      aria-label={`Select model ${model.name}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg overflow-hidden w-12 h-12 flex items-center justify-center">
                        {model.image ? (
                          <img
                            src={model.image || null}
                            alt={model.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Smartphone size={20} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {model.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">
                      {model.brand?.name || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {model.released
                      ? `Released: ${formatReleasedDate(model.released)}`
                      : "No details available"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(model)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(model._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={pages} onPageChange={(p) => setPage(p)} />
      <p className="text-center text-xs text-gray-400 mt-4">
        Total {total} models found
      </p>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {editingModel ? "Edit Model" : "Add New Model"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 overflow-hidden rounded-xl flex-shrink-0">
                    <ImageUpload
                      value={formData.image}
                      onChange={handleImageUpload}
                      placeholder="Model Image"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Model Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Galaxy S23 Ultra"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Brand</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }>
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Release Date/Year
                </label>
                <input
                  type="month"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                  value={releasedToYearMonth(formData.released)}
                  onChange={(e) => {
                    // Convert "2023-02" → "February 2023" for storage so the
                    // table cell and customer pages render consistently.
                    const val = e.target.value; // "2023-02"
                    if (val) {
                      const [year, month] = val.split("-");
                      const display = new Date(Number(year), Number(month) - 1, 1)
                        .toLocaleString("en-US", { month: "long", year: "numeric" });
                      setFormData({ ...formData, released: display });
                    } else {
                      setFormData({ ...formData, released: "" });
                    }
                  }}
                />
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
                  {editingModel ? "UPDATE MODEL" : "CREATE MODEL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => { fetchData(); setIsBulkModalOpen(false); }}
        uploadEndpoint={API_ENDPOINTS.ADMIN_MODELS_BULK_UPLOAD}
        templateColumns={modelTemplateColumns}
        templateSheetName="Models"
        templateFileName="plusway_models_bulk_template.xlsx"
        title="Bulk Upload Models"
        description="Upload multiple phone models at once via Excel spreadsheet"
      />
    </div>
  );
};

export default ModelManagement;
