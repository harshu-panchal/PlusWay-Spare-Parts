import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { ChevronRight, Star, ShoppingCart } from 'lucide-react';

import { useCart } from '../context/CartContext';
import LazyImage from '../../../components/LazyImage';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col h-full">
            <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <LazyImage
                    src={product.images && product.images.length > 0 ? product.images[0] : (product.image || "https://via.placeholder.com/300")}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.countInStock > 0 && <span className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">In Stock</span>}
                </div>
            </Link>

            <div className="p-3 md:p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-400">{product.rating || 0} ({product.numReviews || 0})</span>
                </div>
                <Link to={`/product/${product._id}`} className="font-bold text-secondary text-xs md:text-sm leading-snug mb-2 md:mb-3 hover:text-primary transition-colors block">
                    {product.name}
                </Link>

                <div className="mt-auto flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-base md:text-xl font-black text-secondary tracking-tighter">₹{product.price.toLocaleString()}</span>
                            <span className="text-[10px] md:text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
                        </div>
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">You Save ₹{(product.mrp - product.price).toLocaleString()}</span>
                    </div>

                    <button
                        onClick={() => addToCart(product)}
                        className="bg-primary text-white p-2 md:p-2.5 rounded-lg md:rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                    >
                        <ShoppingCart size={16} className="md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';

const ProductTypeSelection = () => {
    const { modelId } = useParams();
    const [modelInfo, setModelInfo] = useState(null);
    const [groupedProducts, setGroupedProducts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, modelsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/customer/products?model=${modelId}`),
                    axios.get(API_ENDPOINTS.MODELS)
                ]);

                // Find model info
                const foundModel = modelsRes.data.find(m => m._id === modelId);
                setModelInfo(foundModel || { name: "Unknown Model" });

                // Group products by category
                const groups = {};
                productsRes.data.products.forEach(product => {
                    const catName = product.category?.name || "Other";
                    if (!groups[catName]) groups[catName] = [];
                    groups[catName].push(product);
                });
                setGroupedProducts(groups);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [modelId]);

    const categories = Object.keys(groupedProducts);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="bg-[#f4f4f4] min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600 font-bold">{modelInfo.name} Spare Parts & Accessories</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
                {/* Handset Header */}
                <div className="bg-white p-6 mb-8 flex items-center gap-8 border-b border-gray-100 shadow-sm rounded">
                    <div className="w-40 h-40 flex-shrink-0 bg-gray-50 p-4 rounded flex items-center justify-center">
                        <div className="text-center">
                            <span className="block font-black text-primary text-xl tracking-tighter italic">PLUSWAY</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Handset Part</span>
                        </div>
                    </div>
                    <div className="flex-grow">
                        <h1 className="text-2xl font-black text-secondary mb-2 uppercase tracking-tight italic">
                            {modelInfo.name} <span className="text-primary">Spare Parts</span>
                        </h1>
                        <div className="flex flex-col gap-1 text-sm text-gray-500 font-bold">
                            <p>Released: <span className="text-secondary">{modelInfo.released}</span></p>
                            <p>Display Size: <span className="text-secondary">{modelInfo.displaySize}</span></p>
                        </div>
                    </div>
                </div>

                {/* Spare Parts Grid by Category */}
                <div className="space-y-12">
                    {categories.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded shadow-sm">
                            <p className="text-gray-500 font-bold">No products found for this model.</p>
                        </div>
                    ) : (
                        categories.map(category => (
                            <section key={category}>
                                <h2 className="text-xl font-black text-secondary mb-6 uppercase tracking-tight italic border-l-4 border-primary pl-4 bg-white py-3 shadow-sm">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {groupedProducts[category].map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                            </section>
                        )))}
                </div>
            </div>
        </div>
    );
};

export default ProductTypeSelection;
