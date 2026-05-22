import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import {
  ChevronLeft,
  Package,
  Tag,
  Layers,
  Smartphone,
  Boxes,
  IndianRupee,
  BadgeInfo,
  ShieldCheck,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const { data } = await axios.get(API_ENDPOINTS.ADMIN_PRODUCT_DETAIL(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const firstImage = useMemo(
    () =>
      product?.images?.[0] ||
      "https://via.placeholder.com/600x600.png?text=No+Image",
    [product],
  );

  if (loading) {
    return <div className="p-8 text-center font-bold">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        {error || "Product not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500">
            Product ID: {product._id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="aspect-square rounded-lg bg-gray-50 border border-gray-100 overflow-hidden">
              <img src={firstImage} alt={product.name} className="w-full h-full object-contain p-4" />
            </div>
            {product.images?.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {product.images.slice(0, 8).map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="aspect-square rounded border border-gray-100 bg-gray-50 overflow-hidden">
                    <img src={img} alt={`${product.name}-${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Package size={16} className="text-gray-400" />
                <span>Code: {product.code || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Tag size={16} className="text-gray-400" />
                <span>Brand: {product.brand?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Layers size={16} className="text-gray-400" />
                <span>Category: {product.category?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Smartphone size={16} className="text-gray-400" />
                <span>Model: {product.model?.name || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Boxes size={16} className="text-gray-400" />
                <span>Stock: {product.countInStock}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <BadgeInfo size={16} className="text-gray-400" />
                <span>Type: {product.productType || "N/A"}</span>
              </div>
            </div>
            {product.description && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Retail</p>
                <p className="mt-1 text-xl font-bold text-gray-900 flex items-center gap-1">
                  <IndianRupee size={16} /> {Number(product.price || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Wholesale</p>
                <p className="mt-1 text-xl font-bold text-blue-700 flex items-center gap-1">
                  <IndianRupee size={16} /> {Number(product.wholesalePrice || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Min Qty: {product.wholesaleMinQty || 10}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">MRP</p>
                <p className="mt-1 text-xl font-bold text-gray-900 flex items-center gap-1">
                  <IndianRupee size={16} /> {Number(product.mrp || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Attributes</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Colors: </span>
                {product.colors?.length ? product.colors.join(", ") : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Highlights: </span>
                {product.details?.highlights?.length
                  ? product.details.highlights.join(", ")
                  : "N/A"}
              </div>
              <div>
                <span className="font-semibold">Warranty: </span>
                {product.details?.warranty?.summary ||
                  product.details?.warranty?.policy ||
                  "N/A"}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck size={16} className="text-gray-400" />
                <span>
                  Created: {new Date(product.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
