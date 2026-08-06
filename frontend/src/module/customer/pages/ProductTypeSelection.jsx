import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Search,
    SlidersHorizontal,
    X,
    Grid,
    Layers,
    ArrowUpDown,
    Check,
    RotateCcw,
    Loader,
    ChevronDown,
    Filter,
    PackageCheck,
    Smartphone,
    ChevronRight,
    Tag
} from 'lucide-react';

import LazyImage from '../../../components/LazyImage';
import ProductCard from '../components/ProductCard';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { formatReleasedDate } from '../../../utils/formatReleasedDate';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

const PAGE_SIZE = 20;

const PRICE_PRESETS = [
    { label: 'Under ₹500', min: '', max: '500' },
    { label: '₹500 - ₹1.5k', min: '500', max: '1500' },
    { label: '₹1.5k - ₹3k', min: '1500', max: '3000' },
    { label: 'Over ₹3k', min: '3000', max: '' },
];

const ProductTypeSelection = ({ defaultDeviceType }) => {
    const { modelId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const isMobilePath = defaultDeviceType === 'Mobile' || window.location.pathname.includes('/mobile-phones') || window.location.pathname.includes('/mobiles');
    const isSparePartsPath = defaultDeviceType === 'Spare Parts' || window.location.pathname.includes('/spare-parts') || window.location.pathname.includes('/parts');
    const hideFilters = isMobilePath || isSparePartsPath;

    const urlDeviceType = defaultDeviceType || (isMobilePath ? 'Mobile' : isSparePartsPath ? 'Spare Parts' : null) || searchParams.get('deviceType') || searchParams.get('type') || searchParams.get('displayType');

    const [modelInfo, setModelInfo] = useState(null);
    const [modelInfoLoading, setModelInfoLoading] = useState(true);
    
    // All models of the same brand for sidebar model filter
    const [brandModels, setBrandModels] = useState([]);
    const [modelSearchTerm, setModelSearchTerm] = useState('');
    const [allCategories, setAllCategories] = useState([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [deviceType, setDeviceType] = useState(urlDeviceType || 'all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'grid'
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Synchronize deviceType state if URL search param changes
    useEffect(() => {
        if (urlDeviceType) {
            setDeviceType(urlDeviceType);
        }
    }, [urlDeviceType]);

    // Fetch model info, brand models, and category metadata
    useEffect(() => {
        let cancelled = false;
        const fetchMetadata = async () => {
            try {
                setModelInfoLoading(true);
                const [modelRes, catRes] = await Promise.all([
                    axios.get(`${API_ENDPOINTS.MODELS}?all=true`),
                    axios.get(`${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`),
                ]);
                if (cancelled) return;

                const models = modelRes.data.models || modelRes.data || [];
                const found = models.find((m) => m._id === modelId);
                setModelInfo(found || { name: "Unknown Model" });

                // If found, load all models belonging to the same brand for sidebar filtering
                if (found && found.brand) {
                    const brandId = typeof found.brand === 'object' ? found.brand._id : found.brand;
                    const sameBrandModels = models.filter(
                        m => (m.brand?._id === brandId || m.brand === brandId)
                    );
                    setBrandModels(sameBrandModels);
                } else {
                    setBrandModels(models);
                }

                const cats = catRes.data.categories || (Array.isArray(catRes.data) ? catRes.data : []);
                setAllCategories(cats);
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching model info & categories", err);
                setModelInfo({ name: "Unknown Model" });
            } finally {
                if (!cancelled) setModelInfoLoading(false);
            }
        };
        fetchMetadata();
        return () => { cancelled = true; };
    }, [modelId]);

    // Chunked products fetcher connected to API
    const fetchProductsPage = useCallback(async (page) => {
        let url = `${API_BASE_URL}/api/customer/products?model=${modelId}&pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        if (selectedCategory && selectedCategory !== 'all') {
            url += `&category=${selectedCategory}`;
        }
        if (deviceType && deviceType !== 'all' && deviceType.toLowerCase() !== 'spare parts') {
            url += `&deviceType=${encodeURIComponent(deviceType)}`;
        }
        if (searchQuery.trim()) {
            url += `&keyword=${encodeURIComponent(searchQuery.trim())}`;
        }
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (inStockOnly) url += `&inStock=true`;
        if (sortBy) url += `&sort=${sortBy}`;

        const { data } = await axios.get(url);
        const products = data.products || data || [];
        const totalPages = data.pages || 1;
        return {
            items: products,
            hasMore: page < totalPages,
            total: data.total || products.length,
        };
    }, [modelId, selectedCategory, deviceType, searchQuery, minPrice, maxPrice, inStockOnly, sortBy]);

    const resetKey = `${modelId}|${selectedCategory}|${deviceType}|${searchQuery.trim()}|${minPrice}|${maxPrice}|${inStockOnly}|${sortBy}`;

    const {
        items: products,
        loading,
        hasMore,
        sentinelRef,
        total,
    } = useInfiniteScroll({
        fetchPage: fetchProductsPage,
        resetKey,
    });

    // Filter products based on page context (Mobile Phones ONLY vs Spare Parts ONLY)
    const filteredProducts = useMemo(() => {
        if (isMobilePath) {
            // Display ONLY Mobile Phones
            return products.filter(product => {
                const catName = (product.category?.name || "").toLowerCase().trim();
                const prodName = (product.name || "").toLowerCase().trim();
                const prodType = (product.productType || "").toLowerCase().trim();
                const devTypes = Array.isArray(product.deviceType)
                  ? product.deviceType.map((d) => String(d).toLowerCase().trim())
                  : [String(product.deviceType || "").toLowerCase().trim()];
                return catName.includes("mobile") || catName.includes("phone") || prodType.includes("phone") || devTypes.includes("mobile") || prodName.includes("test mobile");
            });
        }
        if (isSparePartsPath) {
            // Display ONLY Spare Parts (Exclude complete handset devices like "TEST MOBILE")
            return products.filter(product => {
                const catName = (product.category?.name || "").toLowerCase().trim();
                const prodName = (product.name || "").toLowerCase().trim();
                const isCompletePhoneCategory = catName === "test mobile" || catName === "mobile" || catName === "mobiles" || catName === "mobile phone" || catName === "mobile phones";
                const isCompletePhoneProduct = prodName === "test mobile";
                return !isCompletePhoneCategory && !isCompletePhoneProduct;
            });
        }
        return products;
    }, [products, isMobilePath, isSparePartsPath]);

    // Group products by category
    const groupedProducts = useMemo(() => {
        const groups = {};
        for (const product of filteredProducts) {
            const catName = product.category?.name || "Other";
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(product);
        }
        return groups;
    }, [filteredProducts]);

    const activeCategories = useMemo(() => {
        return Object.keys(groupedProducts).sort((a, b) => {
            const orderA = groupedProducts[a][0]?.category?.order ?? 9999;
            const orderB = groupedProducts[b][0]?.category?.order ?? 9999;
            return orderA - orderB;
        });
    }, [groupedProducts]);

    const filteredBrandModels = useMemo(() => {
        if (!modelSearchTerm.trim()) return brandModels;
        return brandModels.filter(m =>
            m.name.toLowerCase().includes(modelSearchTerm.toLowerCase().trim())
        );
    }, [brandModels, modelSearchTerm]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedCategory !== 'all') count++;
        if (deviceType !== 'all') count++;
        if (searchQuery.trim()) count++;
        if (minPrice || maxPrice) count++;
        if (inStockOnly) count++;
        if (sortBy !== 'relevance') count++;
        return count;
    }, [selectedCategory, deviceType, searchQuery, minPrice, maxPrice, inStockOnly, sortBy]);

    const handleClearAllFilters = () => {
        setSelectedCategory('all');
        setDeviceType('all');
        setSearchQuery('');
        setMinPrice('');
        setMaxPrice('');
        setInStockOnly(false);
        setSortBy('relevance');
    };

    const applyPricePreset = (preset) => {
        setMinPrice(preset.min);
        setMaxPrice(preset.max);
    };

    const isMobileFlow = deviceType.toLowerCase() === 'mobile';

    if (modelInfoLoading && products.length === 0) {
        return (
            <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
                <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
                    <Loader className="animate-spin text-primary" size={20} />
                    <span className="font-bold text-gray-700">Loading model catalog...</span>
                </div>
            </div>
        );
    }

    // Render Sidebar Content (Shared between Desktop Sidebar & Mobile Drawer)
    const renderSidebarFilters = () => (
        <div className="space-y-6">
            {/* Sidebar Section 1: Device / Item Type Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-primary" /> Product Type
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                    {[
                        { label: 'All Items', value: 'all' },
                        { label: 'Mobile Phones', value: 'Mobile' },
                        { label: 'Spare Parts', value: 'Spare Parts' },
                        { label: 'Accessories', value: 'Accessories' },
                    ].map((typeOption) => {
                        const isSelected = deviceType.toLowerCase() === typeOption.value.toLowerCase();
                        return (
                            <button
                                key={typeOption.value}
                                onClick={() => setDeviceType(typeOption.value)}
                                className={`p-2 rounded-xl text-xs font-bold text-center transition-all ${
                                    isSelected
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {typeOption.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Section 2: Model Selector Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                        <Smartphone size={16} className="text-primary" />
                        {modelInfo?.brand?.name ? `${modelInfo.brand.name} Models` : 'Filter Models'}
                    </h3>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {brandModels.length}
                    </span>
                </div>

                {/* Model Search Input */}
                <div className="relative mb-3">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={modelSearchTerm}
                        onChange={(e) => setModelSearchTerm(e.target.value)}
                        placeholder="Search models..."
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:border-primary focus:outline-none"
                    />
                </div>

                {/* Models List Scrollable */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 sidebar-scrollbar">
                    {filteredBrandModels.map((m) => {
                        const isCurrentModel = m._id === modelId;
                        return (
                            <button
                                key={m._id}
                                onClick={() => {
                                    if (!isCurrentModel) {
                                        const isMobile = deviceType.toLowerCase() === 'mobile' || isMobilePath;
                                        const targetRoute = isMobile
                                            ? `/model/${m._id}/mobile-phones`
                                            : `/model/${m._id}/products`;
                                        navigate(targetRoute);
                                        setMobileFilterOpen(false);
                                    }
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition-all ${
                                    isCurrentModel
                                        ? 'bg-primary text-white shadow-sm font-extrabold'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                }`}
                            >
                                <span className="truncate pr-2">{m.name}</span>
                                {isCurrentModel ? (
                                    <Check size={14} className="shrink-0" />
                                ) : (
                                    <ChevronRight size={12} className="shrink-0 text-gray-400" />
                                )}
                            </button>
                        );
                    })}

                    {filteredBrandModels.length === 0 && (
                        <p className="text-[11px] text-gray-400 text-center py-3">No models found</p>
                    )}
                </div>
            </div>

            {/* Sidebar Section 3: Category Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers size={16} className="text-primary" /> Category Filter
                </h3>
                <div className="space-y-1">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                            selectedCategory === 'all'
                                ? 'bg-secondary text-white shadow-sm'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <span>All Categories</span>
                        {selectedCategory === 'all' && <Check size={14} />}
                    </button>

                    {allCategories.map((cat) => {
                        const isSelected = selectedCategory === cat._id;
                        return (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
                                    isSelected
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <span className="truncate">{cat.name}</span>
                                {isSelected && <Check size={14} />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Section 4: Price Range */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
                <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-3">
                    Price Range (₹)
                </h3>
                <div className="flex items-center gap-2 mb-3">
                    <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Min"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:border-primary focus:outline-none"
                    />
                    <span className="text-gray-400 font-bold">-</span>
                    <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Max"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white focus:border-primary focus:outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {PRICE_PRESETS.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPricePreset(preset)}
                            className="text-[10px] font-bold px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-gray-600 hover:border-primary hover:text-primary transition-colors"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reset Button */}
            {activeFilterCount > 0 && (
                <button
                    onClick={handleClearAllFilters}
                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
                >
                    <RotateCcw size={14} /> Clear All Filters
                </button>
            )}
        </div>
    );

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-16">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-700 font-bold">
                            {modelInfo?.name} {isMobileFlow ? 'Mobile Phones' : 'Spare Parts & Accessories'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Handset Header */}
                {modelInfo && (() => {
                    const headerImage = modelInfo.image || modelInfo.brand?.logo || null;
                    return (
                        <div className="bg-white p-6 mb-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-28 h-28 md:w-32 md:h-32 shrink-0 bg-gray-50 p-4 rounded-xl flex items-center justify-center border border-gray-100">
                                {headerImage ? (
                                    <LazyImage
                                        src={headerImage}
                                        alt={modelInfo.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <span className="block font-black text-primary text-xl tracking-tighter italic">PLUSWAY</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Handset Part</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                    {isMobileFlow ? 'Mobile Phones' : 'Model Spare Parts'}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tight italic">
                                    {modelInfo.name}{' '}
                                    <span className="text-primary">
                                        {isMobileFlow ? 'Mobile Phones' : 'Components'}
                                    </span>
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-gray-500">
                                    {modelInfo.released && (
                                        <p>Released: <span className="text-secondary font-bold">{formatReleasedDate(modelInfo.released)}</span></p>
                                    )}
                                    <span className="hidden md:inline text-gray-300">•</span>
                                    <p>Available Items: <span className="text-primary font-bold">{total || products.length} items</span></p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Layout Grid: Left Sidebar + Right Products */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sticky Desktop Sidebar (Hidden on mobile-phones & spare-parts routes) */}
                    {!hideFilters && (
                        <aside className="hidden lg:block w-72 shrink-0 space-y-6 sticky top-4 self-start">
                            {renderSidebarFilters()}
                        </aside>
                    )}

                    {/* Right Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Top Action Toolbar */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                            {/* Part Search Bar */}
                            <div className="relative w-full sm:max-w-md">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={isMobileFlow ? "Search mobile phones..." : "Search parts by name or SKU..."}
                                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-primary focus:outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Mobile Sidebar Filter Button (Hidden on mobile-phones & spare-parts routes) */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                {!hideFilters && (
                                    <button
                                        onClick={() => setMobileFilterOpen(true)}
                                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold"
                                    >
                                        <SlidersHorizontal size={14} />
                                        <span>Filters</span>
                                        {activeFilterCount > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Sort By */}
                                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700">
                                    <ArrowUpDown size={14} className="mr-1.5 text-gray-500" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent text-secondary font-bold focus:outline-none cursor-pointer pr-4 appearance-none"
                                    >
                                        <option value="relevance">Sort: Relevance</option>
                                        <option value="priceAsc">Price: Low to High</option>
                                        <option value="priceDesc">Price: High to Low</option>
                                        <option value="newest">Newest First</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="nameAsc">Name: A to Z</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 text-gray-400 pointer-events-none" />
                                </div>

                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {!hideFilters && activeFilterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-100 text-xs">
                                <span className="font-bold text-gray-400 uppercase tracking-wider">Active Filters:</span>

                                {deviceType !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                                        Type: {deviceType}
                                        <X size={12} className="cursor-pointer" onClick={() => setDeviceType('all')} />
                                    </span>
                                )}

                                {searchQuery.trim() && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                                        "{searchQuery.trim()}"
                                        <X size={12} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                                    </span>
                                )}

                                {selectedCategory !== 'all' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                                        {allCategories.find(c => c._id === selectedCategory)?.name || 'Category'}
                                        <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory('all')} />
                                    </span>
                                )}

                                {(minPrice || maxPrice) && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                                        ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                                        <X size={12} className="cursor-pointer" onClick={() => { setMinPrice(''); setMaxPrice(''); }} />
                                    </span>
                                )}

                                <button
                                    onClick={handleClearAllFilters}
                                    className="text-red-500 font-bold ml-auto hover:underline"
                                >
                                    Reset
                                </button>
                            </div>
                        )}

                        {/* Products Display */}
                        {viewMode === 'grouped' ? (
                            <div className="space-y-8">
                                {!loading && activeCategories.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                                        <PackageCheck size={44} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-600 font-black uppercase text-sm">
                                            No {isMobileFlow ? 'mobile phones' : 'parts'} match your filter criteria
                                        </p>
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="mt-3 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:bg-primary/90"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    activeCategories.map(category => (
                                        <section key={category}>
                                            <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-primary">
                                                <h2 className="text-base font-black text-secondary uppercase tracking-tight italic">
                                                    {isMobileFlow ? 'MOBILE PHONES' : category}
                                                </h2>
                                                <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                                    {groupedProducts[category].length} items
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                                {groupedProducts[category].map(product => (
                                                    <ProductCard key={product._id} product={product} />
                                                ))}
                                            </div>
                                        </section>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div>
                                {!loading && filteredProducts.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-6">
                                        <PackageCheck size={44} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-600 font-black uppercase text-sm">
                                            No {isMobileFlow ? 'mobile phones' : 'products'} found
                                        </p>
                                        <button
                                            onClick={handleClearAllFilters}
                                            className="mt-3 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-sm hover:bg-primary/90"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                        {filteredProducts.map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Infinite Scroll Sentinel */}
                        <div ref={sentinelRef} aria-hidden="true" className="h-2" />

                        {loading && (
                            <div className="flex items-center justify-center gap-3 py-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
                                <Loader size={18} className="animate-spin text-primary" />
                                Loading items…
                            </div>
                        )}

                        {!hasMore && products.length > 0 && (
                            <p className="text-center py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Showing all {total || products.length} items for {modelInfo?.name}
                            </p>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Drawer Overlay */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                        onClick={() => setMobileFilterOpen(false)}
                    />
                    <div className="relative ml-auto w-full max-w-xs bg-[#f4f4f4] h-full shadow-2xl p-4 overflow-y-auto z-10 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-wider flex items-center gap-2">
                                <Filter size={16} className="text-primary" /> Filters
                            </h2>
                            <button
                                onClick={() => setMobileFilterOpen(false)}
                                className="p-1 rounded-lg bg-gray-200 text-gray-600 hover:text-gray-900"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {renderSidebarFilters()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTypeSelection;
