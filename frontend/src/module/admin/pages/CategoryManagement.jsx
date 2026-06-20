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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { API_BASE_URL } from "../../../config/api";
import Pagination from "../../../components/Pagination";
import { SortableCategoryItem } from "../components/SortableCategoryItem";

const CategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialCategoryState = {
    name: "",
    slug: "",
    image: "",
    isAccessory: false,
    showInMobileSpareParts: false,
    showInAccessories: false,
  };

  const [formData, setFormData] = useState(initialCategoryState);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchItems();
  }, [page, searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      let queryParams = `?pageNumber=${page}`;
      if (searchTerm)
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;

      const { data } = await axios.get(
        `${API_BASE_URL}/api/admin/categories${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setItems(data.categories);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ...item,
        isAccessory: item.isAccessory || false,
        showInMobileSpareParts: item.showInMobileSpareParts || false,
        showInAccessories: item.showInAccessories || false,
      });
    } else {
      setEditingItem(null);
      setFormData(initialCategoryState);
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
          `${API_BASE_URL}/api/admin/categories/${editingItem._id}`,
          formData,
          config,
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/api/admin/categories`,
          formData,
          config,
        );
      }
      fetchItems();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistically update the UI order and prep the payload
        const reorderedData = newItems.map((item, index) => ({
          _id: item._id,
          order: index, // New order index
        }));

        // Send API request in background
        const token = localStorage.getItem("adminToken");
        axios.put(
          `${API_BASE_URL}/api/admin/categories/reorder`,
          { categories: reorderedData },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          console.error("Failed to reorder categories", err);
          setError("Failed to reorder categories.");
        });

        return newItems;
      });
    }
  };

  const handleNameChange = (name) => {
    if (!editingItem) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData({ ...formData, name, slug });
    } else {
      setFormData({ ...formData, name });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Category Management
        </h2>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
            <Plus size={18} />
            <span>Add Category</span>
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
            Loading Categories...
          </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SortableContext 
              items={items.map(item => item._id)}
              strategy={rectSortingStrategy}
            >
              {items.map((item) => (
                <SortableCategoryItem 
                  key={item._id} 
                  item={item} 
                  handleOpenModal={handleOpenModal} 
                  handleDelete={handleDelete} 
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      )}

      <Pagination page={page} pages={pages} onPageChange={(p) => setPage(p)} />
      <p className="text-center text-xs text-gray-400 mt-4">
        Total {total} categories found
      </p>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. LCD Screens"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Category Slug
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="lcd-screens"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showInMobileSpareParts"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.showInMobileSpareParts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showInMobileSpareParts: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="showInMobileSpareParts"
                    className="text-sm font-bold text-gray-700 cursor-pointer">
                    Show in Mobile spare parts
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showInAccessories"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={formData.showInAccessories}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showInAccessories: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="showInAccessories"
                    className="text-sm font-bold text-gray-700 cursor-pointer">
                    Show in Accessories
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Image</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <ImageUpload
                      value={formData.image}
                      onChange={(url) =>
                        setFormData({
                          ...formData,
                          image: url,
                        })
                      }
                      placeholder="Upload Category Image"
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

export default CategoryManagement;
