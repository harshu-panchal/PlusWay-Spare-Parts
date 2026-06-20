import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Loader } from 'lucide-react';

import LazyImage from '../../../components/LazyImage';
import ProductCard from '../components/ProductCard';

import axios from 'axios';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { formatReleasedDate } from '../../../utils/formatReleasedDate';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';

const PAGE_SIZE = 20;

const ProductTypeSelection = () => {
    const { modelId } = useParams();
    const [modelInfo, setModelInfo] = useState(null);
    const [modelInfoLoading, setModelInfoLoading] = useState(true);

    // Model meta (image, brand logo, release date) is a one-shot fetch on
    // mount — only the product list itself is paged.
    useEffect(() => {
        let cancelled = false;
        const fetchModelInfo = async () => {
            try {
                setModelInfoLoading(true);
                const { data } = await axios.get(`${API_ENDPOINTS.MODELS}?all=true`);
                if (cancelled) return;
                const models = data.models || data || [];
                const found = models.find((m) => m._id === modelId);
                setModelInfo(found || { name: "Unknown Model" });
            } catch (err) {
                if (cancelled) return;
                console.error("Error fetching model info", err);
                setModelInfo({ name: "Unknown Model" });
            } finally {
                if (!cancelled) setModelInfoLoading(false);
            }
        };
        fetchModelInfo();
        return () => { cancelled = true; };
    }, [modelId]);

    // Chunked products fetcher. The hook owns the page counter and append logic.
    const fetchProductsPage = useCallback(async (page) => {
        const { data } = await axios.get(
            `${API_BASE_URL}/api/customer/products?model=${modelId}&pageNumber=${page}&pageSize=${PAGE_SIZE}`,
        );
        const products = data.products || data || [];
        const totalPages = data.pages || 1;
        return {
            items: products,
            hasMore: page < totalPages,
            total: data.total || products.length,
        };
    }, [modelId]);

    const {
        items: products,
        loading,
        hasMore,
        sentinelRef,
        total,
    } = useInfiniteScroll({
        fetchPage: fetchProductsPage,
        resetKey: modelId,
    });

    // Group products by category as they accumulate.
    const groupedProducts = useMemo(() => {
        const groups = {};
        for (const product of products) {
            const catName = product.category?.name || "Other";
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(product);
        }
        return groups;
    }, [products]);

    const categories = Object.keys(groupedProducts).sort((a, b) => {
        const orderA = groupedProducts[a][0].category?.order ?? 9999;
        const orderB = groupedProducts[b][0].category?.order ?? 9999;
        return orderA - orderB;
    });

    if (modelInfoLoading && products.length === 0) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="bg-[#f4f4f4] min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-600 font-bold">{modelInfo?.name} Spare Parts & Accessories</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
                {/* Handset Header */}
                {modelInfo && (() => {
                    // Display priority: model image -> brand logo -> branded placeholder.
                    const headerImage = modelInfo.image || modelInfo.brand?.logo || null;
                    return (
                        <div className="bg-white p-6 mb-8 flex items-center gap-8 border-b border-gray-100 shadow-sm rounded">
                            <div className="w-40 h-40 shrink-0 bg-gray-50 p-4 rounded flex items-center justify-center">
                                {headerImage ? (
                                    <LazyImage
                                        src={headerImage}
                                        alt={modelInfo.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <span className="block font-black text-primary text-xl tracking-tighter italic">PLUSWAY</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Handset Part</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow">
                                <h1 className="text-2xl font-black text-secondary mb-2 uppercase tracking-tight italic">
                                    {modelInfo.name} <span className="text-primary">Spare Parts</span>
                                </h1>
                                <div className="flex flex-col gap-1 text-sm text-gray-500 font-bold">
                                    <p>Released: <span className="text-secondary">{modelInfo.released ? formatReleasedDate(modelInfo.released) : "—"}</span></p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Spare Parts Grid by Category */}
                <div className="space-y-12">
                    {!loading && categories.length === 0 ? (
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
            </div>
        </div>
    );
};

export default ProductTypeSelection;
