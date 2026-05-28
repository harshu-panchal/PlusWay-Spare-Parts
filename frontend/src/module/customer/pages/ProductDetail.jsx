import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../../config/api";
import {
  products,
  modelSpecificProducts,
  modelSpecificCategories,
} from "../data/mockData";
import { useCart } from "../context/CartContext";
import {
  ChevronRight,
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Share2,
  CheckCircle2,
  PhoneCall,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Play,
} from "lucide-react";
import LazyImage from "../../../components/LazyImage";
import ImageZoom from "../components/ImageZoom";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!rating || !comment) {
      alert("Please select a rating and write a comment");
      return;
    }
    try {
      setSubmittingReview(true);
      const token = localStorage.getItem("token");
      await axios.post(
        API_ENDPOINTS.CREATE_REVIEW(id),
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSubmittingReview(false);
      setRating(0);
      setComment("");
      alert("Review submitted successfully");
      // Reload product to show new review
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
        setProduct(data);
        setSelectedImage(
          data.images && data.images.length > 0
            ? data.images[0]
            : data.image || "https://via.placeholder.com/400",
        );
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
        setLoading(false);

        // Save to Recently Viewed
        const recent = JSON.parse(
          localStorage.getItem("recentlyViewed") || "[]",
        );
        const newRecent = [
          {
            _id: data._id,
            name: data.name,
            image:
              data.images && data.images.length > 0
                ? data.images[0]
                : data.image || "",
            price: data.price,
            mrp: data.mrp,
            countInStock: data.countInStock,
            wholesalePrice: data.wholesalePrice,
            wholesaleMinQty: data.wholesaleMinQty,
          },
          ...recent.filter((item) => item._id !== data._id),
        ].slice(0, 8); // Keep last 8 items
        localStorage.setItem("recentlyViewed", JSON.stringify(newRecent));
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (product && product.category) {
        try {
          const catId = product.category._id || product.category;
          const { data } = await axios.get(
            `${API_ENDPOINTS.PRODUCTS}?category=${catId}`,
          );
          // Filter out the current product and limit to 10 for scroller
          setRelatedProducts(
            data.products.filter((p) => p._id !== product._id).slice(0, 10),
          );
        } catch (err) {
          console.error("Error fetching related products", err);
        }
      }
    };
    fetchRelatedProducts();
  }, [product]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!product)
    return <div className="p-20 text-center">Product not found</div>;

  const savings = product.mrp - product.price;
  const savingsPercent = Math.round((savings / product.mrp) * 100);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="bg-[#f4f4f4] min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              to={product.model ? `/products?model=${product.model._id}` : "#"}
              className="hover:text-primary">
              {product.model?.name || "Model"}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-bold">
              {product.name.split("-")[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Gallery (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 border border-gray-200 relative group">
              <div className="aspect-square bg-white">
                <ImageZoom
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full"
                />
              </div>
              {savingsPercent > 0 && (
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-black px-2 py-1 shadow-lg">
                  SAVE {savingsPercent}%
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {(product.images || [product.image]).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 border-2 flex-shrink-0 bg-white p-1 transition-all ${selectedImage === img ? "border-primary" : "border-gray-200 hover:border-gray-300"}`}>
                  <LazyImage
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center italic leading-tight">
              Image for presentation only. Actual product can be different from
              the product shown.
            </p>
          </div>

          {/* Middle: Info & Actions (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 border border-gray-200 h-fit">
            <h1 className="text-lg font-black text-secondary leading-tight mb-4 uppercase">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.rating || 0) ? "fill-current" : ""
                    }
                  />
                ))}
              </div>
              <span 
                onClick={() => {
                  setActiveTab("Customer Reviews");
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm text-blue-600 underline font-bold cursor-pointer">
                {product.numReviews || 0} reviews
              </span>
              <span 
                onClick={() => {
                  setActiveTab("Customer Reviews");
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm text-blue-600 underline font-bold cursor-pointer">
                Write a review
              </span>
            </div>

            {/* Color Variants */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Color:{" "}
                  <span className="text-primary">
                    {selectedColor || product.colors[0]}
                  </span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm font-bold border-2 rounded-lg transition-all ${
                        selectedColor === color || (!selectedColor && i === 0)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Stack */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2 text-sm text-gray-500">
                  <span>List price:</span>
                  <span className="line-through">
                    {product.mrp.toLocaleString()}.00 Rs.
                  </span>
                </div>
                <div className="bg-[#f8f9fa] p-4 border-l-4 border-secondary flex flex-col gap-2 rounded-r-2xl">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-secondary italic tracking-tighter">
                      {(quantity >= (product.wholesaleMinQty || 10)
                        ? product.wholesalePrice
                        : product.price
                      ).toLocaleString()}
                      .00
                    </span>
                    <span className="text-xl font-bold text-secondary tracking-tight">
                      Rs.
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                      Current Unit Price
                    </span>
                  </div>

                  {product.wholesalePrice > 0 && (
                    <div
                      className={`mt-2 p-3 rounded-xl border transition-all ${quantity >= (product.wholesaleMinQty || 10) ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-100"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${quantity >= (product.wholesaleMinQty || 10) ? "text-blue-600" : "text-gray-400"}`}>
                            Wholesale Pricing
                          </span>
                          <span className="text-sm font-black text-secondary">
                            ₹{product.wholesalePrice.toLocaleString()}{" "}
                            <span className="text-[10px] font-bold text-gray-400">
                              for {product.wholesaleMinQty || 10}+ pieces
                            </span>
                          </span>
                        </div>
                        {quantity >= (product.wholesaleMinQty || 10) ? (
                          <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">
                            Applied
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-bold text-blue-600 cursor-help"
                            title={`Buy ${product.wholesaleMinQty || 10} or more to get this price`}>
                            Save ₹
                            {(
                              product.price - product.wholesalePrice
                            ).toLocaleString()}{" "}
                            per unit!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-sm text-red-600 font-bold flex flex-col">
                <span>
                  You save:{" "}
                  {(
                    product.mrp -
                    (quantity >= (product.wholesaleMinQty || 10)
                      ? product.wholesalePrice
                      : product.price)
                  ).toLocaleString()}
                  .00 Rs.
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-70">
                  Total Savings on MRP
                </span>
              </div>
              <div className="text-sm text-secondary font-bold flex items-center gap-1.5 pt-2">
                Cash Back:{" "}
                <span className="bg-gray-100 px-2 py-0.5 rounded">
                  {product.cashback} Rs.
                </span>
              </div>
            </div>

            <div className="text-[11px] text-blue-600 underline font-bold mb-6 cursor-pointer block">
              Report incorrect product information.
            </div>

            <div className="text-sm text-secondary mb-8">
              Expected delivery to Pincode{" "}
              <span className="font-bold underline">457001</span> by:{" "}
              <span className="font-black">Tomorrow</span> (if ordered within{" "}
              <span className="text-green-600 font-black">1 hr 6 mins</span>).{" "}
              <span className="text-blue-600 underline cursor-pointer ml-1">
                Details
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-secondary font-black">
              <span>CODE:</span>
              <span className="bg-gray-50 px-2 py-1 text-[11px] font-bold border border-gray-100">
                {product.code}
              </span>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl mb-8 border border-orange-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
                  Total Amount Payable
                </p>
                <p className="text-2xl font-black text-secondary tracking-tighter">
                  ₹
                  {(
                    (quantity >= (product.wholesaleMinQty || 10)
                      ? product.wholesalePrice
                      : product.price) * quantity
                  ).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Quantity
                </p>
                <p className="text-xl font-black text-secondary">{quantity}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase">
                  Quantity:
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        product.countInStock,
                        Math.max(1, e.target.value),
                      ),
                    )
                  }
                  className="w-16 h-10 border border-gray-300 text-center font-bold outline-none"
                  max={product.countInStock}
                  min={1}
                />
              </div>
              <div className="flex flex-1 gap-2 pt-6">
                <button
                  onClick={async () => {
                    await clearCart();
                    await addToCart(
                      {
                        ...product,
                        image: selectedImage,
                        color: selectedColor,
                      },
                      Number(quantity),
                    );
                    navigate("/checkout");
                  }}
                  disabled={product.countInStock === 0}
                  className={`flex-1 border-2 border-primary font-black py-3 px-4 transition-colors uppercase italic tracking-tighter text-sm ${product.countInStock === 0 ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" : "bg-white text-primary hover:bg-orange-50"}`}>
                  {product.countInStock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
                <button
                  onClick={() => {
                    addToCart(
                      {
                        ...product,
                        image: selectedImage,
                        color: selectedColor,
                      },
                      Number(quantity),
                    );
                  }}
                  disabled={product.countInStock === 0}
                  className={`flex-1 font-black py-3 px-4 transition-colors uppercase italic tracking-tighter text-sm ${product.countInStock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-orange-600"}`}>
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Video Section */}
            {product.videoUrl && (
              <div className="mt-8 bg-gray-50 border border-gray-200 p-8 flex flex-col items-center">
                <div className="relative w-full max-w-2xl aspect-video bg-black shadow-2xl">
                  <iframe
                    src={getEmbedUrl(product.videoUrl)}
                    className="w-full h-full"
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen></iframe>
                </div>
                <p className="mt-4 text-xs font-black text-gray-400 uppercase italic">
                  Product Video Demonstration
                </p>
              </div>
            )}
          </div>

          {/* Right: Side Panel (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-4 border border-gray-200 text-right space-y-4">
              <div>
                <h4 className="font-black text-secondary text-sm">
                  Need help?
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  Call us on 9599197756 & select ext. 2 to speak to our sales
                  team specialist.
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  Free Shipping
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  All India Free Shipping with Express Delivery
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  Plusway Guarantee
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  100% Refund if you do not get your shipment within time
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  Payment Protection
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  Secure Payments & Easy Returns
                </p>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-end gap-3 text-right">
                <div>
                  <Link
                    to={
                      product.model
                        ? `/products?model=${product.model._id}`
                        : "#"
                    }
                    className="text-[11px] font-black text-blue-600 underline">
                    {product.model?.name || "View specific products"}
                  </Link>
                  <p className="text-[10px] text-gray-400 font-bold">
                    See more awesome products for your handset
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                  {product.model?.image ? (
                    <LazyImage
                      src={product.model.image}
                      alt={product.model.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[8px] font-bold text-gray-400 text-center leading-none p-1">
                      {product.model?.name?.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div id="reviews-section" className="mt-12 bg-white border border-gray-200">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              "Description",
              "Warranty",
              "Shipping Estimation",
              "Customer Reviews",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-black uppercase italic tracking-tighter border-b-2 transition-all whitespace-nowrap ${activeTab === tab ? "border-primary text-secondary" : "border-transparent text-gray-400 hover:text-secondary hover:bg-gray-50"}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === "Description" && (
              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-black text-secondary mb-4 uppercase italic">
                    Product <span className="text-primary">Details</span>
                  </h3>
                  <div className="text-sm text-gray-600 leading-relaxed font-bold space-y-4">
                    {product.description && (
                      Array.isArray(product.description) ? (
                        product.description.map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))
                      ) : (
                        <p>{product.description}</p>
                      )
                    )}
                    {product.details?.descriptionPoints &&
                      product.details.descriptionPoints.length > 0 && (
                        <ul className="list-disc pl-5 space-y-2 mt-4">
                          {product.details.descriptionPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      )}
                  </div>
                </section>

                {/* Highlights */}
                {product.details?.highlights &&
                  product.details.highlights.length > 0 && (
                    <div className="mb-8">
                      <h4 className="font-black text-secondary mb-4 uppercase italic">
                        Highlights
                      </h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 font-bold">
                        {product.details.highlights.map((h, i) => (
                          <li key={i}>{typeof h === "string" ? h : h.type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="grid md:grid-cols-2 gap-8">
                  {product.details?.inTheBox && (
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                        <tr>
                          <th
                            colSpan="2"
                            className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                            In The Box
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="p-3 text-secondary font-black">
                            {product.details.inTheBox}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {/* Specifications */}
                  {product.details?.specs && product.details.specs.length > 0 && (
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                        <tr>
                          <th
                            colSpan="2"
                            className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                            Specifications
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.details.specs
                          .filter(spec => spec.key && spec.key.toLowerCase() !== 'source url')
                          .map((spec, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3 w-1/3 text-gray-500 font-bold border-r border-gray-100">
                              {spec.key}
                            </td>
                            <td className="p-3 text-secondary font-black">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Warranty" && (
              <div className="space-y-6 mb-8">
                {product.details?.warranty ? (
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th
                          colSpan="2"
                          className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                          Warranty Information
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.details.warranty.period && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Period
                          </td>
                          <td className="p-3 text-secondary font-black">
                            {product.details.warranty.period}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty.policy && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Policy
                          </td>
                          <td className="p-3 text-secondary font-black">
                            {product.details.warranty.policy}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty.summary && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Summary
                          </td>
                          <td className="p-3 text-secondary font-black">
                            {product.details.warranty.summary}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p>No warranty information available.</p>
                )}
              </div>
            )}

            {activeTab === "Customer Reviews" && (
              <div className="space-y-12">
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-4 bg-gray-50 p-6 border border-gray-200 h-fit">
                    <h3 className="text-lg font-black text-secondary uppercase italic mb-4">
                      Customer Reviews ({product.numReviews})
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl font-black text-secondary italic">
                        {product.rating?.toFixed(1) || 0}
                      </span>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < Math.round(product.rating || 0)
                                ? "fill-current"
                                : ""
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                      Based on {product.numReviews} ratings
                    </p>
                  </div>

                  <div className="md:col-span-8">
                    {userInfo ? (
                      <form
                        onSubmit={submitReviewHandler}
                        className="bg-white p-6 border border-gray-100 mb-8">
                        <h4 className="text-lg font-black text-secondary uppercase italic mb-4">
                          Write a Review
                        </h4>
                        <div className="mb-4">
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            Rating
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}>
                                <Star
                                  size={24}
                                  className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                            Comment
                          </label>
                          <textarea
                            rows="3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-primary"
                            placeholder="Share your experience..."></textarea>
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="bg-primary text-white font-black py-3 px-6 uppercase italic text-sm hover:bg-orange-600 transition-all disabled:opacity-50">
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-gray-50 p-6 border border-gray-200 mb-8 text-center">
                        <p className="font-bold text-gray-600 mb-4">
                          Please sign in to write a review
                        </p>
                        <Link
                          to="/login"
                          className="inline-block bg-secondary text-white font-black py-2 px-6 uppercase italic text-xs hover:bg-primary transition-all">
                          Sign In
                        </Link>
                      </div>
                    )}

                    <div className="space-y-6">
                      {product.reviews.length === 0 && (
                        <p className="text-gray-500 italic">No reviews yet.</p>
                      )}
                      {product.reviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="bg-white p-6 border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-black text-secondary text-sm">
                                {rev.name}
                              </h5>
                              <div className="flex items-center text-yellow-500 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={
                                      i < rev.rating ? "fill-current" : ""
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                              {rev.createdAt?.substring(0, 10)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-bold mt-2">
                            "{rev.comment}"
                          </p>
                          {rev.adminReply && (
                            <div className="mt-4 bg-gray-50 border-l-4 border-secondary p-3">
                              <p className="text-[10px] font-black text-secondary uppercase mb-1">
                                Response from Plusway
                              </p>
                              <p className="text-xs text-gray-600">
                                {rev.adminReply}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Scroller */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">
                You might also <span className="text-primary italic">like</span>
              </h2>
              <Link
                to={`/products?type=${product.category._id || product.category}`}
                className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                View all related
              </Link>
            </div>
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-[2%] px-[2%] md:mx-0 md:px-0 scroll-smooth">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  className="w-[150px] md:w-[240px] flex-shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
