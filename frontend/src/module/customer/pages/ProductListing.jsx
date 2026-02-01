import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Filter, ChevronDown, ShoppingCart, Star } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';

const ProductListing = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const modelId = queryParams.get('model');
    const typeId = queryParams.get('type');
    const keyword = queryParams.get('keyword');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                let url = `${API_BASE_URL}/api/customer/products?`;
                if (modelId) url += `model=${modelId}&`;
                // Note: Backend expects 'category' for what frontend calls 'type' usually, 
                // or 'productType' string. For now, assuming 'type' param maps to 'category' ID if it's an ObjectId, 
                // or we need to adjust navigation. 
                // However, the prompt implies "Add Product" flow. 
                // Let's assume standard filtering.
                if (typeId) url += `category=${typeId}&`;
                if (keyword) url += `keyword=${keyword}&`;

                const { data } = await axios.get(url);
                setProducts(data.products);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [modelId, typeId, keyword, location.search]);

    // Mock data for display titles (optional, could fetch real objects)
    const modelName = "Selected Model";
    const typeName = "Selected Category";

    const [loadingModels, setLoadingModels] = useState(true);
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);

    // Fetch models and brands for filters
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                setLoadingModels(true);
                const [modelRes, brandRes] = await Promise.all([
                    axios.get(API_ENDPOINTS.MODELS),
                    axios.get(API_ENDPOINTS.BRANDS)
                ]);
                setModels(modelRes.data);
                setBrands(brandRes.data);
                setLoadingModels(false);
            } catch (error) {
                console.error("Error fetching filters", error);
                setLoadingModels(false);
            }
        };
        fetchFilters();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 py-6">
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
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
                            <h1 className="text-lg font-black text-secondary uppercase italic tracking-tighter">
                                Products <span className="text-primary tracking-normal not-italic lowercase font-medium ml-2">({products.length} items)</span>
                            </h1>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <span>Sort by:</span>
                                <button className="flex items-center gap-1 text-secondary">Relevance <ChevronDown size={14} /></button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
                                    <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={product.images && product.images.length > 0 ? product.images[0] : (product.image || "https://via.placeholder.com/300")}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {product.countInStock > 0 && <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">In Stock</span>}
                                        </div>
                                    </Link>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                            <span className="text-[10px] font-bold text-gray-400">{product.rating} ({product.numReviews || 0})</span>
                                        </div>
                                        <Link to={`/product/${product._id}`} className="font-bold text-secondary text-sm leading-snug mb-3 hover:text-primary transition-colors block line-clamp-2 min-h-[40px]">
                                            {product.name}
                                        </Link>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black text-secondary tracking-tighter">₹{product.price.toLocaleString()}</span>
                                                    <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">You Save ₹{(product.mrp - product.price).toLocaleString()}</span>
                                            </div>

                                            <button className="bg-primary text-white p-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                                                <ShoppingCart size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

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
