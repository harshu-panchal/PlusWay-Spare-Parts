import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, Navigate } from 'react-router-dom';

import { ChevronRight, Search, Smartphone } from 'lucide-react';

import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';
import LazyImage from '../../../components/LazyImage';
import { releasedToYearMonth } from '../../../utils/formatReleasedDate';

const ModelSelection = () => {
    const { brandId } = useParams();
    const [searchParams] = useSearchParams();
    const deviceTypeParam = searchParams.get('deviceType') || searchParams.get('type');

    if (deviceTypeParam?.toLowerCase() === 'mobile') {
        return <Navigate to={brandId ? `/products?brand=${brandId}&deviceType=Mobile` : `/products?deviceType=Mobile`} replace />;
    }

    const [models, setModels] = useState([]);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("alphabetical");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modelsRes, brandsRes] = await Promise.all([
                    axios.get(`${API_ENDPOINTS.MODELS}?all=true`),
                    axios.get(`${API_ENDPOINTS.BRANDS}?all=true`)
                ]);

                // Filter models for this brand
                const allModels = modelsRes.data.models || modelsRes.data || [];
                const filtered = allModels.filter(m => m.brand?._id === brandId || m.brand === brandId);
                setModels(filtered);

                // Find brand info
                const brands = brandsRes.data.brands || brandsRes.data || [];
                const foundBrand = brands.find(b => b._id === brandId);
                setBrand(foundBrand);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [brandId]);

    const displayModels = models
        .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === "alphabetical") {
                return a.name.localeCompare(b.name);
            } else if (sortOrder === "newest" || sortOrder === "oldest") {
                // Route every released-string shape (dd/mm/yyyy, "February 2023",
                // ISO, …) through releasedToYearMonth → reliable Date.parse.
                const ymA = releasedToYearMonth(a.released);
                const ymB = releasedToYearMonth(b.released);
                const dateA = ymA ? Date.parse(ymA) : 0;
                const dateB = ymB ? Date.parse(ymB) : 0;
                const valA = isNaN(dateA) ? 0 : dateA;
                const valB = isNaN(dateB) ? 0 : dateB;
                
                if (valA === valB) {
                    return a.name.localeCompare(b.name);
                }
                
                if (sortOrder === "newest") {
                    return valB - valA;
                } else {
                    return valA - valB;
                }
            }
            return 0;
        });

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/brand-selection" className="hover:text-primary uppercase">Brands</Link>
                    <ChevronRight size={14} />
                    <span className="font-bold text-secondary uppercase">{brand?.name}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-secondary mb-2 uppercase italic tracking-tighter">
                            {brand?.name} <span className="text-primary italic">MODELS</span>
                        </h1>
                        <p className="text-gray-500">Select your specific mobile model to find compatible parts</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <select
                            className="px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:border-primary text-gray-600 appearance-none min-w-[200px]"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <option value="alphabetical">Alphabetical (A-Z)</option>
                            <option value="newest">Release Date (Newest)</option>
                            <option value="oldest">Release Date (Oldest)</option>
                        </select>
                        <div className="relative flex-1 md:w-80">
                            <input
                                type="text"
                                placeholder="Search model (e.g. S23 Ultra)"
                                className="w-full pl-4 pr-10 py-3 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayModels.map((model) => (
                        <Link
                            key={model._id}
                            to={
                                deviceTypeParam?.toLowerCase() === 'mobile'
                                    ? `/model/${model._id}/mobile-phones`
                                    : (deviceTypeParam?.toLowerCase() === 'spare parts' || deviceTypeParam?.toLowerCase() === 'spare')
                                    ? `/model/${model._id}/spare-parts`
                                    : `/model/${model._id}/products${deviceTypeParam ? `?deviceType=${encodeURIComponent(deviceTypeParam)}` : ''}`
                            }
                            className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden"
                        >
                            <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
                                {model.image ? (
                                    <LazyImage
                                        src={model.image}
                                        alt={model.name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <Smartphone size={32} className="text-gray-300 group-hover:text-primary transition-colors" />
                                )}
                            </div>

                            <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
                                <h3 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {model.name}
                                </h3>
                            </div>
                        </Link>
                    ))}
                    {displayModels.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No models found</h3>
                            <p className="text-gray-400">Try searching for a different model name</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelSelection;
