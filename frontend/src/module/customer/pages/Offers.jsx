import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Flame, Loader2, Tag } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import OfferBannerCarousel from "../components/OfferBannerCarousel";
import OfferCard from "../components/OfferCard";

/**
 * Customer Offers page: offer-page banners and a card per live offer.
 */
const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            axios.get(API_ENDPOINTS.OFFERS),
            axios.get(API_ENDPOINTS.BANNERS).catch(() => ({ data: [] })),
        ])
            .then(([offersRes, bannersRes]) => {
                if (cancelled) return;
                setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
                const allBanners = Array.isArray(bannersRes.data) ? bannersRes.data : [];
                setBanners(allBanners.filter((b) => b.type === "offer"));
            })
            .catch(() => !cancelled && setError("Couldn't load offers. Please try again."))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-16">
            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6 md:py-8 space-y-8">
                <OfferBannerCarousel banners={banners} />

                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase italic tracking-tighter flex items-center gap-2">
                            <Flame className="text-primary" size={30} />
                            Offers <span className="text-primary">&amp; Deals</span>
                        </h1>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                            Limited-time prices on genuine parts
                        </p>
                    </div>
                    {offers.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                            <Tag size={13} /> {offers.length} live offer{offers.length === 1 ? "" : "s"}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                ) : error ? (
                    <p className="text-center text-red-500 font-bold py-16">{error}</p>
                ) : offers.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 md:p-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
                            <Tag size={30} />
                        </div>
                        <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                            No live offers right now
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">New deals drop regularly — check back soon.</p>
                        <Link
                            to="/products"
                            className="inline-block mt-6 bg-secondary text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-opacity-90">
                            Browse all products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {offers.map((offer) => (
                            <OfferCard key={offer._id} offer={offer} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offers;
