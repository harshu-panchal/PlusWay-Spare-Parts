import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Filter, Loader } from "lucide-react";
import { API_ENDPOINTS, API_BASE_URL } from "../../../config/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";
import LazyImage from "../../../components/LazyImage";
import { formatReleasedDate } from "../../../utils/formatReleasedDate";
import useInfiniteScroll from "../../../hooks/useInfiniteScroll";

const PAGE_SIZE = 20;

const ProductListing = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get("model");
  // Accept both ?category= (used by header / category links) and ?type= (legacy)
  const categoryId = queryParams.get("category") || queryParams.get("type");
  const keyword = queryParams.get("keyword");
  const brandId = queryParams.get("brand");
  const deviceType = queryParams.get("deviceType");

  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Derived state for the selected model / category
  const selectedModel = models.find((m) => m._id === modelId);
  const selectedCategory = categories.find((c) => c._id === categoryId);

  const [sortBy, setSortBy] = useState("relevance");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Chunked products fetcher. The hook handles page state + appending.
  const fetchProductsPage = useCallback(
    async (page) => {
      let url = `${API_BASE_URL}/api/customer/products?pageNumber=${page}&pageSize=${PAGE_SIZE}&`;
      if (modelId) url += `model=${modelId}&`;
      if (categoryId) url += `category=${categoryId}&`;
      if (keyword) url += `keyword=${keyword}&`;
      if (brandId) url += `brand=${brandId}&`;
      if (deviceType) url += `deviceType=${encodeURIComponent(deviceType)}&`;
      url += `sort=${sortBy}&_t=${Date.now()}`;

      const { data } = await axios.get(url);
      const items = data.products || [];
      const totalPages = data.pages || 1;
      return {
        items,
        hasMore: page < totalPages,
        total: data.total || items.length,
      };
    },
    [modelId, categoryId, keyword, sortBy, brandId, deviceType],
  );

  const {
    items: products,
    loading,
    hasMore,
    error,
    total,
    sentinelRef,
  } = useInfiniteScroll({
    fetchPage: fetchProductsPage,
    // Any change to these filters resets the list and re-fetches page 1.
    resetKey: `${modelId || ""}|${categoryId || ""}|${keyword || ""}|${brandId || ""}|${deviceType || ""}|${sortBy}`,
  });

  // Whenever the filter/sort changes, jump back to the top of the listing.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [modelId, categoryId, keyword, sortBy, brandId, deviceType]);

  const [loadingModels, setLoadingModels] = useState(true);

  // Fetch models, brands & categories for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingModels(true);
        const [modelRes, brandRes, categoryRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.MODELS}?all=true`),
          axios.get(`${API_ENDPOINTS.BRANDS}?all=true`),
          axios.get(`${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`),
        ]);
        setModels(modelRes.data.models || modelRes.data || []);
        setBrands(brandRes.data.brands || brandRes.data || []);
        setCategories(
          categoryRes.data.categories ||
            (Array.isArray(categoryRes.data) ? categoryRes.data : []),
        );
        setLoadingModels(false);
      } catch (error) {
        console.error("Error fetching filters", error);
        setLoadingModels(false);
      }
    };
    fetchFilters();
  }, []);

  const { addToCart } = useCart();

  // Show full-screen loading only on the very first load (no products yet).
  // Subsequent loads use the inline "Loading more…" indicator instead.
  if (loading && products.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error.message || "Failed to load products"}
      </div>
    );

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="uppercase">
            {modelId
              ? selectedModel?.name || "All Models"
              : selectedCategory
                ? selectedCategory.name
                : "Products"}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Mobile (hidden when viewing a specific model) */}
          {!modelId && (
          <div className="lg:hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
                className="w-full p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-black text-secondary uppercase text-sm tracking-widest">
                  Filters
                </span>
                <Filter size={16} className="text-gray-500" />
              </button>

              {isMobileFiltersOpen && (
                <div className="p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-900 text-sm">Models</h3>
                    {loadingModels ? (
                      <p className="text-sm text-gray-500">Loading filters...</p>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          to={`/products${categoryId ? `?category=${categoryId}` : ''}${keyword ? (categoryId ? '&' : '?') + `keyword=${keyword}` : ''}`}
                          className={`block text-sm ${!modelId ? "font-bold text-primary" : "text-gray-600 hover:text-primary"}`}>
                          All Models
                        </Link>
                        {models.map((model) => {
                          let url = `/products?model=${model._id}`;
                          if (categoryId) url += `&category=${categoryId}`;
                          if (keyword) url += `&keyword=${keyword}`;
                          return (
                            <Link
                              key={model._id}
                              to={url}
                              className={`block text-sm ${modelId === model._id ? "font-bold text-primary" : "text-gray-600 hover:text-primary"}`}>
                              {model.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Filters Sidebar - Desktop (hidden when viewing a specific model) */}
          {!modelId && (
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-black text-secondary uppercase text-sm tracking-widest">
                  Filters
                </span>
                <Filter size={16} className="text-gray-400" />
              </div>
              <div className="p-5 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Models Filter */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900 text-sm">Models</h3>
                  <div className="space-y-2">
                    <Link
                      to={`/products${categoryId ? `?category=${categoryId}` : ''}${keyword ? (categoryId ? '&' : '?') + `keyword=${keyword}` : ''}`}
                      className={`block text-sm ${!modelId ? "font-bold text-primary" : "text-gray-600 hover:text-primary"}`}>
                      All Models
                    </Link>
                    {models.map((model) => {
                      let url = `/products?model=${model._id}`;
                      if (categoryId) url += `&category=${categoryId}`;
                      if (keyword) url += `&keyword=${keyword}`;
                      return (
                        <Link
                          key={model._id}
                          to={url}
                          className={`block text-sm ${modelId === model._id ? "font-bold text-primary" : "text-gray-600 hover:text-primary"}`}>
                          {model.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Model Banner - Only if model is selected */}
            {selectedModel && (() => {
              // Display priority: model image -> brand logo -> branded placeholder.
              const bannerImage =
                selectedModel.image || selectedModel.brand?.logo || null;
              return (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 flex items-center justify-center p-4 rounded-xl shrink-0">
                    {bannerImage ? (
                      <LazyImage
                        src={bannerImage}
                        alt={selectedModel.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <span className="text-orange-500 font-black italic text-xl">
                          PLUSWAY
                        </span>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
                          Handset Part
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-2xl md:text-3xl font-black text-secondary uppercase italic tracking-tighter leading-none">
                      {selectedModel.name}{" "}
                      <span className="text-primary block md:inline">
                        SPARE PARTS
                      </span>
                    </h1>
                    {selectedModel.released && (
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 font-bold">
                          Released:{" "}
                          <span className="text-secondary">
                            {formatReleasedDate(selectedModel.released)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
              {selectedModel ? (
                <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                  <h2 className="text-lg font-black text-secondary uppercase italic tracking-tighter">
                    SPARE PARTS
                  </h2>
                </div>
              ) : selectedCategory ? (
                <h1 className="text-lg font-black text-secondary uppercase italic tracking-tighter">
                  {selectedCategory.name}{" "}
                  <span className="text-primary tracking-normal not-italic lowercase font-medium ml-2">
                    ({total} items)
                  </span>
                </h1>
              ) : (
                <h1 className="text-lg font-black text-secondary uppercase italic tracking-tighter">
                  Products{" "}
                  <span className="text-primary tracking-normal not-italic lowercase font-medium ml-2">
                    ({total} items)
                  </span>
                </h1>
              )}
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-secondary font-bold focus:outline-none cursor-pointer">
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="nameAsc">Name: A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Infinite-scroll sentinel + loading / end-of-list indicators */}
            <div ref={sentinelRef} aria-hidden="true" className="h-1" />

            {loading && products.length > 0 && (
              <div className="flex items-center justify-center gap-3 py-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
                <Loader size={16} className="animate-spin text-primary" />
                Loading more…
              </div>
            )}

            {!hasMore && products.length > 0 && (
              <p className="text-center py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Showing all {total || products.length} products
              </p>
            )}

            {!loading && products.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                <p className="text-gray-400 font-black uppercase tracking-widest">
                  No products found
                </p>
                <Link
                  to="/"
                  className="text-primary font-bold mt-4 inline-block hover:underline">
                  Back to Homepage
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
