import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
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

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState("Description");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
        setProduct(data);
        setSelectedImage(data.images && data.images.length > 0 ? data.images[0] : (data.image || "https://via.placeholder.com/400"));
        setLoading(false);

        // Save to Recently Viewed
        const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const newRecent = [
          {
            _id: data._id,
            name: data.name,
            image: data.images && data.images.length > 0 ? data.images[0] : (data.image || ""),
            price: data.price,
            mrp: data.mrp
          },
          ...recent.filter((item) => item._id !== data._id)
        ].slice(0, 8); // Keep last 8 items
        localStorage.setItem("recentlyViewed", JSON.stringify(newRecent));

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!product) return <div className="p-20 text-center">Product not found</div>;

  const savings = product.mrp - product.price;
  const savingsPercent = Math.round((savings / product.mrp) * 100);

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
              to={`/model/${product.modelId}`}
              className="hover:text-primary">
              Note 20 Ultra 5G
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-bold">
              {product.name.split("-")[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Gallery (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 border border-gray-200 relative group">
              <div className="aspect-square overflow-hidden bg-white">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain cursor-zoom-in"
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
                  <img
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
                      i < Math.floor(product.rating) ? "fill-current" : ""
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-blue-600 underline font-bold cursor-pointer">
                {product.reviewsCount || 17} reviews
              </span>
              <span className="text-sm text-blue-600 underline font-bold cursor-pointer">
                Write a review
              </span>
            </div>

            {/* Pricing Stack */}
            <div className="space-y-1 mb-8">
              <div className="flex items-baseline gap-2 text-sm text-gray-500">
                <span>List price:</span>
                <span className="line-through">
                  {product.mrp.toLocaleString()}.00 Rs.
                </span>
              </div>
              <div className="text-3xl font-black text-secondary italic tracking-tighter flex items-baseline gap-2">
                {product.price.toLocaleString()}.00{" "}
                <span className="text-lg not-italic font-bold">Rs.</span>
              </div>
              <div className="text-sm text-red-600 font-bold">
                You save: {savings.toLocaleString()}.00 Rs. ({savingsPercent}%)
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

            <div className="flex items-center gap-4 mb-8 text-sm text-secondary font-black">
              <span>CODE:</span>
              <span className="bg-gray-50 px-2 py-1 text-[11px] font-bold border border-gray-100">
                {product.code}
              </span>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase">
                  Quantity:
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                  className="w-16 h-10 border border-gray-300 text-center font-bold outline-none"
                />
              </div>
              <div className="flex flex-1 gap-2 pt-6">
                <button className="flex-1 bg-white border-2 border-primary text-primary font-black py-3 px-4 hover:bg-orange-50 transition-colors uppercase italic tracking-tighter text-sm">
                  Buy Now
                </button>
                <button
                  onClick={() => {
                    addToCart({ ...product, image: selectedImage }, quantity);
                    alert("Added to cart!");
                  }}
                  className="flex-1 bg-primary text-white font-black py-3 px-4 hover:bg-orange-600 transition-colors uppercase italic tracking-tighter text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
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
                    to={`/model/${product.modelId}`}
                    className="text-[11px] font-black text-blue-600 underline">
                    Samsung Galaxy Note 20 Ultra 5G
                  </Link>
                  <p className="text-[10px] text-gray-400 font-bold">
                    See more awesome products for your handset
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                  <span className="text-[8px] font-bold text-gray-400">
                    NOTE 20
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="mt-12 bg-white border border-gray-200">
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
                    <p>
                      Got broken display in your Samsung Galaxy Note 20 Ultra
                      5G? Buy the complete LCD with Touch Screen for Samsung
                      Galaxy Note 20 Ultra 5G - Black and replace the broken,
                      cracked or scratched screen in your handset. 100% Perfect
                      fit with high manufacturing quality. With least technical
                      know how required, it is easiest to replace display for
                      your handset.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Easiest part type available for your handset with least
                        technical knowledge required.
                      </li>
                      <li>High quality product with 100% perfect fit.</li>
                      <li>
                        Complete display combo with LCD screen and digitizer
                        touch screen.
                      </li>
                      <li>Tested before shipping (QC done).</li>
                    </ul>
                  </div>
                </section>

                {/* Dynamic Specifications */}
                {product.details?.specs && product.details.specs.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-black text-secondary mb-4 uppercase italic">Specifications</h4>
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <tbody>
                        {product.details.specs.map((spec, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3 w-1/3 text-gray-500 font-bold border-r border-gray-100">{spec.key}</td>
                            <td className="p-3 text-secondary font-black">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Highlights */}
                {product.details?.highlights && product.details.highlights.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-black text-secondary mb-4 uppercase italic">Highlights</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 font-bold">
                      {product.details.highlights.map((h, i) => (
                        <li key={i}>{typeof h === 'string' ? h : h.type}</li>
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

                  {/* Compatibility (Mock or if implemented) */}
                  {product.details?.compatibility && (
                    <table className="w-full border-collapse border border-gray-200 text-sm">
                      <thead>
                        <tr>
                          <th
                            colSpan="2"
                            className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                            Compatibility
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Check if compatibility is object or string */}
                        {typeof product.details.compatibility === 'object' ? Object.entries(product.details.compatibility).map(
                          ([key, val]) => (
                            <tr key={key} className="border-b border-gray-100">
                              <td className="p-3 w-1/3 text-gray-500 font-bold border-r border-gray-100">
                                {key}
                              </td>
                              <td className="p-3 text-secondary font-black">
                                {val}
                              </td>
                            </tr>
                          ),
                        ) : (
                          <tr><td className="p-3">{product.details.compatibility}</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Video Section */}
                {product.videoUrl && (
                  <div className="mt-8 bg-gray-50 border border-gray-200 p-8 flex flex-col items-center">
                    <div className="relative w-full max-w-2xl aspect-video bg-black shadow-2xl">
                      <iframe
                        src={product.videoUrl}
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
            )}

            {activeTab === "Warranty" && (
              <div className="space-y-6 mb-8">
                {product.details?.warranty ? (
                  <table className="w-full border-collapse border border-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th colSpan="2" className="bg-gray-50 p-3 text-left font-black uppercase italic border border-gray-200">
                          Warranty Information
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.details.warranty.period && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">Period</td>
                          <td className="p-3 text-secondary font-black">{product.details.warranty.period}</td>
                        </tr>
                      )}
                      {product.details.warranty.policy && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">Policy</td>
                          <td className="p-3 text-secondary font-black">{product.details.warranty.policy}</td>
                        </tr>
                      )}
                      {product.details.warranty.summary && (
                        <tr className="border-b border-gray-100">
                          <td className="p-3 w-1/4 text-gray-500 font-bold border-r border-gray-100">Summary</td>
                          <td className="p-3 text-secondary font-black">{product.details.warranty.summary}</td>
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
                {/* Reviews Summary - Only show if reviews exist or default show empty state */}
                {product.reviews && product.reviews.length > 0 ? (
                  <>
                    {/* ... Existing Review Grid ... */}
                    <div className="grid md:grid-cols-12 gap-8">
                      {/* ... (Keep existing review summary logic but use product props safely) ... */}
                      <div className="md:col-span-4 bg-gray-50 p-6 border border-gray-200 h-fit">
                        {/* ... Rating Summary ... */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl font-black text-secondary italic">
                            {product.rating || 0}
                          </span>
                          {/* ... Stars ... */}
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">
                          Average Rating based on {product.numReviews} ratings
                        </p>
                        <button className="w-full mt-8 bg-white border border-secondary text-secondary font-black py-3 px-4 uppercase italic text-sm hover:bg-secondary hover:text-white transition-all">
                          Write a review
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 pt-12 border-t border-gray-100">
                      {product.reviews.map((rev, i) => (
                        <div key={i} className="bg-white p-6 border border-gray-50 hover:border-gray-100 transition-all">
                          <p>"{rev.content || "Good product"}"</p>
                          {/* ... rest of review item ... */}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500 font-bold">No reviews yet.</p>
                    <button className="mt-4 bg-primary text-white font-black py-3 px-6 rounded uppercase italic text-sm hover:bg-orange-600 transition-all">
                      Be the first to review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products Scroller */}
        {/* Placeholder for Related Products - To be implemented with real API relations */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
            You might also like
          </h2>
          <p className="text-sm text-gray-400">Related products coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
