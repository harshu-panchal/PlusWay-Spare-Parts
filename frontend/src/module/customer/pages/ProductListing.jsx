import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Filter } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { useCart } from '../context/CartContext';
import Pagination from '../../../components/Pagination';
import ProductCard from '../components/ProductCard';
import LazyImage from "../../../components/LazyImage";

const ProductListing = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modelId = queryParams.get('model');
    const typeId = queryParams.get('type');
    const keyword = queryParams.get('keyword');

    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);

    // Derived state for the selected model
    const selectedModel = models.find(m => m._id === modelId);

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [sortBy, setSortBy] = useState("relevance");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url = `${API_BASE_URL}/api/customer/products?pageNumber=${page}&`;
                if (modelId) url += `model=${modelId}&`;
                if (typeId) url += `category=${typeId}&`;
                if (keyword) url += `keyword=${keyword}&`;
                url += `sort=${sortBy}&`;

                const { data } = await axios.get(url);
                setProducts(data.products);
                setPages(data.pages);
                setTotal(data.total);
                setLoading(false);
                // Scroll to top when page changes
                window.scrollTo(0, 0);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [modelId, typeId, keyword, location.search, page, sortBy]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [modelId, typeId, keyword, location.search, sortBy]);

    // Mock data for display titles (optional, could fetch real objects)
    const modelName = "Selected Model";
    const typeName = "Selected Category";

    const [loadingModels, setLoadingModels] = useState(true);

    // Fetch models and brands for filters
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setLoadingModels(true);
                const [modelRes, brandRes] = await Promise.all([
                    axios.get(`${API_ENDPOINTS.MODELS}?all=true`),
                    axios.get(`${API_ENDPOINTS.BRANDS}?all=true`)
                ]);
                setModels(modelRes.data.models || modelRes.data || []);
                setBrands(brandRes.data.brands || brandRes.data || []);
                setLoadingModels(false);
            } catch (error) {
                console.error("Error fetching filters", error);
                setLoadingModels(false);
            }
        };
        fetchFilters();
    }, []);


    const { addToCart } = useCart();

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={12} />
                    <span className="uppercase">{modelId ? models.find(m => m._id === modelId)?.name || "All Models" : "Products"}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <span className="font-black text-secondary uppercase text-sm tracking-widest">Filters</span>
                                <Filter size={16} className="text-gray-400" />
                            </div>
                            <div className="p-5 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {/* Models Filter */}
                                <div className="space-y-3">
                                    <h3 className="font-bold text-gray-900 text-sm">Models</h3>
                                    <div className="space-y-2">
                                        <Link to={`/products`} className={`block text-sm ${!modelId ? 'font-bold text-primary' : 'text-gray-600 hover:text-primary'}`}>All Models</Link>
                                        {models.map(model => (
                                            <Link
                                                key={model._id}
                                                to={`/products?model=${model._id}`}
                                                className={`block text-sm ${modelId === model._id ? 'font-bold text-primary' : 'text-gray-600 hover:text-primary'}`}
                                            >
                                                {model.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Model Banner - Only if model is selected */}
                        {selectedModel && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-50 flex items-center justify-center p-4 rounded-xl flex-shrink-0">
                                    {selectedModel.image ? (
                                        <LazyImage src={selectedModel.image} alt={selectedModel.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-center">
                                            <span className="text-orange-500 font-black italic text-xl">PLUSWAY</span>
                                            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Handset Part</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <h1 className="text-2xl md:text-3xl font-black text-secondary uppercase italic tracking-tighter leading-none">
                                        {selectedModel.name} <span className="text-primary block md:inline">SPARE PARTS</span>
                                    </h1>
                                    <div className="space-y-1 pt-2">
                                        {selectedModel.released && (
                                            <p className="text-xs text-gray-500 font-bold">
                                                Released: <span className="text-secondary">{selectedModel.released}</span>
                                            </p>
                                        )}
                                        {selectedModel.displaySize && (
                                            <p className="text-xs text-gray-500 font-bold">
                                                Display Size: <span className="text-secondary">{selectedModel.displaySize}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                            {selectedModel ? (
                                <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                                    <h2 className="text-lg font-black text-secondary uppercase italic tracking-tighter">SPARE PARTS</h2>
                                </div>
                            ) : (
                                <h1 className="text-lg font-black text-secondary uppercase italic tracking-tighter">
                                    Products <span className="text-primary tracking-normal not-italic lowercase font-medium ml-2">({total} items)</span>
                                </h1>
                            )}
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span>Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setPage(1);
                                    }}
                                    className="bg-transparent text-secondary font-bold focus:outline-none cursor-pointer"
                                >
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

                        {/* Pagination */}
                        <Pagination
                            page={page}
                            pages={pages}
                            onPageChange={(p) => setPage(p)}
                        />

                        {products.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                                <p className="text-gray-400 font-black uppercase tracking-widest">No products found</p>
                                <Link to="/" className="text-primary font-bold mt-4 inline-block hover:underline">Back to Homepage</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
