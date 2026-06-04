import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { ChevronRight, Star, ShoppingCart } from 'lucide-react';

import { useCart } from '../context/CartContext';
import LazyImage from '../../../components/LazyImage';
import ProductCard from '../components/ProductCard';



import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { formatReleasedDate } from '../../../utils/formatReleasedDate';

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
                    axios.get(`${API_ENDPOINTS.MODELS}?all=true`)
                ]);

                // Find model info
                const models = modelsRes.data.models || modelsRes.data || [];
                const foundModel = models.find(m => m._id === modelId);
                setModelInfo(foundModel || { name: "Unknown Model" });

                // Group products by category
                const groups = {};
                const products = productsRes.data.products || productsRes.data || [];
                products.forEach(product => {
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
                            <p>Released: <span className="text-secondary">{formatReleasedDate(modelInfo.released)}</span></p>
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
