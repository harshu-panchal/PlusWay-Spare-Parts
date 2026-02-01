import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { ChevronRight, Search, Smartphone } from 'lucide-react';

import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/api';

const ModelSelection = () => {
    const { brandId } = useParams();
    const [models, setModels] = useState([]);
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [modelsRes, brandsRes] = await Promise.all([
                    axios.get(API_ENDPOINTS.MODELS),
                    axios.get(API_ENDPOINTS.BRANDS)
                ]);

                // Filter models for this brand
                const allModels = modelsRes.data;
                const filtered = allModels.filter(m => m.brand?._id === brandId || m.brand === brandId);
                setModels(filtered);

                // Find brand info
                const foundBrand = brandsRes.data.find(b => b._id === brandId);
                setBrand(foundBrand);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [brandId]);

    const displayModels = models.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

                    <div className="relative w-full md:w-80">
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayModels.map((model) => (
                        <Link
                            key={model._id}
                            to={`/model/${model._id}/products`}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-transparent hover:border-primary/30 group overflow-hidden relative flex flex-col"
                        >
                            <div className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
                                {model.image ? (
                                    <img
                                        src={model.image}
                                        alt={model.name}
                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <Smartphone size={32} className="text-gray-200 group-hover:text-primary transition-colors" />
                                )}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="p-3 text-center flex-1 flex flex-col justify-center bg-white relative z-10">
                                <h3 className="font-bold text-secondary text-sm group-hover:text-primary transition-colors uppercase tracking-tight leading-tight line-clamp-2">
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
