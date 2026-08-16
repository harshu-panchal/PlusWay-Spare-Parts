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
import { useCountryPricing } from "../../../contexts/CountryPricingContext";
import {
  ChevronRight,
  ChevronLeft,
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
import ImageLightbox from "../components/ImageLightbox";
import ProductCard from "../components/ProductCard";
import useSwipe from "../../../hooks/useSwipe";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [sidebarInfo, setSidebarInfo] = useState({
    needHelp: { title: "Need help?", description: "Call us on 9870162128 to speak to our support & sales specialist." },
    freeShipping: { title: "Free Shipping", description: "All India Free Shipping with Express Delivery" },
    guarantee: { title: "Plusway Guarantee", description: "100% Refund if you do not get your shipment within time" },
    paymentProtection: { title: "Payment Protection", description: "Secure Payments & Easy Returns" }
  });
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayColors = React.useMemo(() => {
    if (!product) return [];
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants.map(v => v.colorName);
    }
    return product.colors || [];
  }, [product]);

  const selectedVariant = React.useMemo(() => {
    if (!product || !selectedColor) return null;
    if (product.colorVariants && product.colorVariants.length > 0) {
      return product.colorVariants.find(v => v.colorName === selectedColor) || null;
    }
    return null;
  }, [product, selectedColor]);

  // Country-aware pricing — auto-converts from INR or uses manual override if set by admin
  const { getPriceForCountry, formatPrice } = useCountryPricing();
  const pricing = React.useMemo(
    () => (product ? getPriceForCountry(product, selectedVariant) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, selectedVariant, getPriceForCountry]
  );

  // Keep these helpers for backward compatibility with the rest of the component
  const effectivePrice           = pricing?.price           ?? 0;
  const effectiveMrp             = pricing?.mrp             ?? 0;
  const effectiveWholesalePrice  = pricing?.wholesalePrice  ?? 0;
  const effectiveWholesaleMinQty = pricing?.wholesaleMinQty ?? (product?.wholesaleMinQty || 10);
  const effectiveCurrencySymbol  = pricing?.currencySymbol  ?? "₹";
  const effectiveCountInStock    = selectedVariant?.countInStock != null ? selectedVariant.countInStock : product?.countInStock;
  const effectiveSku             = selectedVariant?.sku || product?.code;

  const displayImages = React.useMemo(() => {
    if (!product) return [];
    let imgs = product.images || (product.image ? [product.image] : []);
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      imgs = selectedVariant.images;
    }
    return imgs.length > 0 ? imgs : ["https://via.placeholder.com/400"];
  }, [product, selectedVariant]);

  useEffect(() => {
    if (displayImages && displayImages.length > 0) {
      setSelectedImage(displayImages[0]);
    }
  }, [selectedColor, product]);

  // Touch swipe navigation for the main gallery — wraps around at the ends
  // so swiping past the last image returns to the first, matching the
  // existing chevron behavior.
  const navigateImageBy = (delta) => {
    if (!displayImages?.length) return;
    const curIdx = displayImages.indexOf(selectedImage);
    const baseIdx = curIdx === -1 ? 0 : curIdx;
    const newIdx =
      (baseIdx + delta + displayImages.length) % displayImages.length;
    setSelectedImage(displayImages[newIdx]);
  };
  const gallerySwipe = useSwipe({
    onSwipeLeft: () => navigateImageBy(1),
    onSwipeRight: () => navigateImageBy(-1),
  });

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
        if (data.colorVariants && data.colorVariants.length > 0) {
          setSelectedColor(data.colorVariants[0].colorName);
        } else if (data.colors && data.colors.length > 0) {
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

    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(API_ENDPOINTS.GET_SETTINGS);
        if (data && data.productSidebar) {
          setSidebarInfo(data.productSidebar);
        }
      } catch (err) {
        console.error("Error fetching settings", err);
      }
    };
    fetchSettings();
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

  const savings = effectiveMrp - effectivePrice;
  const savingsPercent = Math.round((savings / effectiveMrp) * 100);

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
              to="/section/697c5e98d1ffb9d52de9a3c2"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          {/* Left: Gallery (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-4">
            <div className="bg-white p-4 border border-gray-200 relative group">
              <div
                {...gallerySwipe.swipeHandlers}
                onClick={() => {
                  // Browsers fire a synthesized `click` at the end of a
                  // touch — skip opening the lightbox when the user was
                  // actually swiping between images.
                  if (gallerySwipe.wasSwiped()) return;
                  setLightboxOpen(true);
                }}
                className="aspect-square bg-white overflow-hidden relative cursor-zoom-in touch-pan-y select-none"
                title="Click to view larger">
                <div 
                  className="flex transition-transform duration-500 ease-in-out h-full w-full"
                  style={{ transform: `translateX(-${displayImages.indexOf(selectedImage) !== -1 ? displayImages.indexOf(selectedImage) * 100 : 0}%)` }}
                >
                  {displayImages.map((img, idx) => (
                    <div key={idx} className="w-full h-full flex-shrink-0">
                      <ImageZoom
                        src={img}
                        alt={`${product.name} - image ${idx + 1}`}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = displayImages.indexOf(selectedImage);
                      const prevIdx = (curIdx - 1 + displayImages.length) % displayImages.length;
                      setSelectedImage(displayImages[prevIdx]);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white text-secondary rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10">
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={(e) => {
                      e.stopPropagation();
                      const curIdx = displayImages.indexOf(selectedImage);
                      const nextIdx = (curIdx + 1) % displayImages.length;
                      setSelectedImage(displayImages[nextIdx]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white text-secondary rounded-full shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 z-10">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {savingsPercent > 0 && (
                <div className="absolute top-4 right-4 bg-orange-600 text-white text-[10px] font-black px-2 py-1 shadow-lg">
                  SAVE {savingsPercent}%
                </div>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {displayImages.map((img, idx) => (
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
          <div className="lg:col-span-5 bg-white p-6 border border-gray-200">
            <h1 className="text-2xl font-black text-secondary leading-tight mb-4">
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
            {displayColors && displayColors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  {product.variantType || "Color"}:{" "}
                  <span className="text-primary">
                    {selectedColor || displayColors[0]}
                  </span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {displayColors.map((color, i) => {
                    const variant = product.colorVariants?.find(v => v.colorName === color);
                    const variantStock = variant?.countInStock;
                    const isOutOfStock = variantStock != null && variantStock === 0;
                    const isActive = selectedColor === color || (!selectedColor && i === 0);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        className={`relative px-4 py-2 text-sm font-bold border-2 rounded-lg transition-all ${
                          isActive
                            ? "border-primary bg-primary/5 text-primary"
                            : isOutOfStock
                            ? "border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            : "border-gray-200 hover:border-gray-300"
                        }`}>
                        {color}
                        {isOutOfStock && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                            OUT
                          </span>
                        )}
                        {variant && variantStock != null && variantStock > 0 && variantStock <= 5 && (
                          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
                            {variantStock} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Variant-level stock info */}
                {selectedVariant && selectedVariant.countInStock != null && (
                  <p className={`mt-2 text-xs font-bold ${selectedVariant.countInStock === 0 ? "text-red-500" : selectedVariant.countInStock <= 5 ? "text-orange-500" : "text-emerald-600"}`}>
                    {selectedVariant.countInStock === 0
                      ? "Out of stock for this color"
                      : selectedVariant.countInStock <= 5
                      ? `Only ${selectedVariant.countInStock} left in this color`
                      : `${selectedVariant.countInStock} in stock`}
                  </p>
                )}
              </div>
            )}

            {/* Pricing Stack */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2 text-sm text-gray-500">
                  <span>List price:</span>
                  <span className="line-through">
                    {effectiveCurrencySymbol}{formatPrice(effectiveMrp)}
                  </span>
                </div>
                <div className="bg-[#f8f9fa] p-4 border-l-4 border-secondary flex flex-col gap-2 rounded-r-2xl">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-secondary italic tracking-tighter">
                      {effectiveCurrencySymbol}{formatPrice(
                        quantity >= effectiveWholesaleMinQty
                          ? effectiveWholesalePrice
                          : effectivePrice
                      )}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                      Current Unit Price
                    </span>
                  </div>

                  {effectiveWholesalePrice > 0 && (
                    <div
                      className={`mt-2 p-3 rounded-xl border transition-all ${quantity >= effectiveWholesaleMinQty ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-gray-100"}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest ${quantity >= effectiveWholesaleMinQty ? "text-blue-600" : "text-gray-400"}`}>
                            Wholesale Pricing
                          </span>
                          <span className="text-sm font-black text-secondary">
                            {effectiveCurrencySymbol}{formatPrice(effectiveWholesalePrice)}{" "}
                            <span className="text-[10px] font-bold text-gray-400">
                              for {effectiveWholesaleMinQty}+ pieces
                            </span>
                          </span>
                        </div>
                        {quantity >= effectiveWholesaleMinQty ? (
                          <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase">
                            Applied
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-bold text-blue-600 cursor-help"
                            title={`Buy ${effectiveWholesaleMinQty} or more to get this price`}>
                            Save {effectiveCurrencySymbol}
                            {formatPrice(effectivePrice - effectiveWholesalePrice)}{" "}
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
                  {effectiveCurrencySymbol}{formatPrice(
                    effectiveMrp -
                    (quantity >= effectiveWholesaleMinQty
                      ? effectiveWholesalePrice
                      : effectivePrice)
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-widest opacity-70">
                  Total Savings on MRP
                </span>
              </div>

              {/* Country pricing info — shown only for non-Indian users */}
              {pricing?.currencyCode && pricing.currencyCode !== "INR" && (
                <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg">
                  <span>🌍</span>
                  <span>
                    Prices shown in <strong>{pricing.countryName}</strong> ({pricing.currencyCode})
                    {pricing.isConverted && <span className="ml-1 text-gray-400">· auto-converted from INR</span>}
                    {pricing.isOverride && <span className="ml-1 text-emerald-600 font-bold">· local price</span>}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-secondary font-black">
              <span>CODE:</span>
              <span key={effectiveSku} className="bg-gray-50 px-2 py-1 text-[11px] font-bold border border-gray-100 font-mono animate-in fade-in duration-300">
                {effectiveSku}
              </span>
            </div>

            <div className="p-4 bg-orange-50 rounded-2xl mb-8 border border-orange-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
                  Total Amount Payable
                </p>
                <p className="text-2xl font-black text-secondary tracking-tighter">
                  {effectiveCurrencySymbol}
                  {formatPrice(
                    (quantity >= effectiveWholesaleMinQty
                      ? effectiveWholesalePrice
                      : effectivePrice) * quantity
                  )}
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
                        effectiveCountInStock,
                        Math.max(1, e.target.value),
                      ),
                    )
                  }
                  className="w-16 h-10 border border-gray-300 text-center font-bold outline-none"
                  max={effectiveCountInStock}
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
                        price: effectivePrice,
                        mrp: effectiveMrp,
                        wholesalePrice: effectiveWholesalePrice,
                        wholesaleMinQty: effectiveWholesaleMinQty,
                        countInStock: effectiveCountInStock,
                        code: effectiveSku,
                      },
                      Number(quantity),
                    );
                    navigate("/checkout");
                  }}
                  disabled={effectiveCountInStock === 0}
                  className={`flex-1 border-2 border-primary font-black py-3 px-4 transition-colors uppercase italic tracking-tighter text-sm ${effectiveCountInStock === 0 ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed" : "bg-white text-primary hover:bg-orange-50"}`}>
                  {effectiveCountInStock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
                <button
                  onClick={() => {
                    addToCart(
                      {
                        ...product,
                        image: selectedImage,
                        color: selectedColor,
                        price: effectivePrice,
                        mrp: effectiveMrp,
                        wholesalePrice: effectiveWholesalePrice,
                        wholesaleMinQty: effectiveWholesaleMinQty,
                        countInStock: effectiveCountInStock,
                        code: effectiveSku,
                      },
                      Number(quantity),
                    );
                  }}
                  disabled={effectiveCountInStock === 0}
                  className={`flex-1 font-black py-3 px-4 transition-colors uppercase italic tracking-tighter text-sm ${effectiveCountInStock === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-orange-600"}`}>
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Video Section — moved to standalone card below */}
          </div>

          {/* Right: Side Panel (3 cols) */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
            <div className="bg-white p-4 border border-gray-200 text-right space-y-4">
              <div>
                <h4 className="font-black text-secondary text-sm">
                  {sidebarInfo.needHelp?.title || "Need help?"}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {sidebarInfo.needHelp?.description || "Call us on 9870162128 to speak to our support & sales specialist."}
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  {sidebarInfo.freeShipping?.title || "Free Shipping"}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {sidebarInfo.freeShipping?.description || "All India Free Shipping with Express Delivery"}
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  {sidebarInfo.guarantee?.title || "Plusway Guarantee"}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {sidebarInfo.guarantee?.description || "100% Refund if you do not get your shipment within time"}
                </p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <h4 className="font-black text-secondary text-sm">
                  {sidebarInfo.paymentProtection?.title || "Payment Protection"}
                </h4>
                <p className="text-[10px] text-gray-500 font-bold leading-tight">
                  {sidebarInfo.paymentProtection?.description || "Secure Payments & Easy Returns"}
                </p>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-end gap-3 text-right">
                <div>
                  <Link
                    to="/section/697c5e98d1ffb9d52de9a3c2"
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

        {/* Video Card — full width, between product grid and tabs */}
        {product.videoUrl && (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Play size={16} className="text-primary" />
              <h3 className="text-sm font-black text-secondary uppercase italic tracking-tighter">
                Product Video
              </h3>
            </div>
            <div className="p-6 flex justify-center bg-gray-50">
              <div className="w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={getEmbedUrl(product.videoUrl)}
                  className="w-full h-full"
                  title="Product Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

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
                  <div className="text-sm text-gray-600 leading-relaxed space-y-4">
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

                <div className="space-y-6">
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
                          <td className="p-3 text-secondary font-normal">
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
                            <td className="p-3 text-secondary font-normal">
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
                {product.details ? (
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th
                          colSpan="2"
                          className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                          Warranty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.details.warranty?.coveredInWarranty && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Covered in Warranty
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.coveredInWarranty}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty?.summary && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Warranty Summary
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.summary}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty?.serviceType && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Warranty Service Type
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.serviceType}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty?.tnc && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Warranty T&C
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.tnc}
                          </td>
                        </tr>
                      )}
                      {product.details.countryOfOrigin && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Country of Origin
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.countryOfOrigin}
                          </td>
                        </tr>
                      )}
                      {product.details.packer && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Packer
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.packer}
                          </td>
                        </tr>
                      )}
                      {/* Fallbacks for older data */}
                      {product.details.warranty?.period && !product.details.warranty?.coveredInWarranty && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Warranty Period
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.period}
                          </td>
                        </tr>
                      )}
                      {product.details.warranty?.policy && !product.details.warranty?.serviceType && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">
                            Warranty Policy
                          </td>
                          <td className="p-3 text-secondary font-normal">
                            {product.details.warranty.policy}
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

      <ImageLightbox
        isOpen={lightboxOpen}
        images={displayImages}
        initialIndex={Math.max(0, displayImages.indexOf(selectedImage))}
        onClose={() => setLightboxOpen(false)}
        alt={product?.name || ""}
      />
    </div>
  );
};

export default ProductDetail;
