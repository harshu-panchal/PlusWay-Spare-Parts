import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Search,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RefreshCw,
  Save,
  Plus,
  X,
  Package,
  History,
} from "lucide-react";
import Pagination from "../../../components/Pagination";

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `${API_ENDPOINTS.ADMIN_PRODUCTS}?pageNumber=${page}`,
        config
      );
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: 0,
    type: "add", // 'add' or 'set'
    reason: "Restock",
    variantColorName: "", // empty = product-level stock
  });



  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData({
        productId: product._id,
        quantity: 0,
        type: "add",
        reason: "Restock",
        variantColorName: "",
      });
      setSelectedProduct(product);
    } else {
      setFormData({
        productId: "",
        quantity: 0,
        type: "add",
        reason: "Restock",
        variantColorName: "",
      });
      setSelectedProduct(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pid = formData.productId;
      const qty = parseInt(formData.quantity);
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        API_ENDPOINTS.ADMIN_PRODUCT_STOCK(pid),
        {
          quantity: qty,
          type: formData.type,
          variantColorName: formData.variantColorName || undefined,
        },
        config
      );

      // Refresh products to show updated stock
      fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update stock", error);
      alert("Failed to update stock");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search products for stock..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
            <AlertTriangle size={16} />
            <span className="font-medium">5 items low on stock</span>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={18} />
            <span>Update Stock</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <History size={18} />
            <span>History</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Product
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Current Stock
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Adjustment
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0] || null}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="text-gray-300 w-full h-full p-2" />
                        )}

                      </div>
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          SKU: {product.code || (product._id ? product._id.substring(0, 6) : "N/A")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.countInStock < 10
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}>
                          {product.countInStock} units
                        </span>
                        {product.countInStock < 10 && (
                          <AlertTriangle size={14} className="text-amber-500" />
                        )}
                      </div>
                      {/* Variant stock summary */}
                      {product.colorVariants?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.colorVariants.map((v, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                (v.countInStock ?? 0) === 0
                                  ? "bg-red-50 text-red-600 border-red-100"
                                  : (v.countInStock ?? 0) < 5
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : "bg-gray-50 text-gray-500 border-gray-100"
                              }`}>
                              {v.colorName}: {v.countInStock ?? 0}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
                        Adjust
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Quick Update">
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={(p) => setPage(p)}
      />
      <p className="text-center text-xs text-gray-400 mt-4">
        Total {total} products found
      </p>

      {/* Stock Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Update Stock Levels
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Select Product
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.productId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setFormData({ ...formData, productId: pid });
                    setSelectedProduct(
                      products.find((p) => p.id === parseInt(pid)),
                    );
                  }}
                  disabled={!!selectedProduct}>
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-3">
                  <Package className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-bold text-blue-900">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      Current Stock: {selectedProduct.countInStock} units
                    </p>
                  </div>
                </div>
              )}

              {/* Variant selector — only show if product has colorVariants */}
              {selectedProduct?.colorVariants?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Update Stock For
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.variantColorName}
                    onChange={(e) => setFormData({ ...formData, variantColorName: e.target.value })}>
                    <option value="">— Product-level stock (overall) —</option>
                    {selectedProduct.colorVariants.map((v, i) => (
                      <option key={i} value={v.colorName}>
                        {v.colorName} (current: {v.countInStock ?? 0})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400">Choose a color variant to update its individual stock, or leave blank to update the product overall stock.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Adjustment Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }>
                    <option value="add">Add to Stock</option>
                    <option value="set">Set Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Reason / Reference
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }>
                  <option value="Restock">New Shipment / Restock</option>
                  <option value="Return">Customer Return</option>
                  <option value="Correction">Inventory Correction</option>
                  <option value="Damage">Damaged / Written Off</option>
                </select>
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
                  <Save size={18} />
                  UPDATE STOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
