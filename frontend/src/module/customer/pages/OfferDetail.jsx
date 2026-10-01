import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flame, Loader2, Tag } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";
import ProductCard from "../components/ProductCard";
import DealCountdown from "../components/DealCountdown";
import { offerGradient, offerHeadline } from "../../../utils/offers";

const SORTS = [
    { key: "discount", label: "Biggest discount" },
    { key: "priceAsc", label: "Price: low to high" },
    { key: "priceDesc", label: "Price: high to low" },
    { key: "name", label: "Name A–Z" },
];

const dealPrice = (p) => (p.deal ? p.deal.price : p.price) || 0;

const sortProducts = (products, sort) => {
    const list = [...products];
    switch (sort) {
        case "priceAsc":
            return list.sort((a, b) => dealPrice(a) - dealPrice(b));
        case "priceDesc":
            return list.sort((a, b) => dealPrice(b) - dealPrice(a));
        case "name":
            return list.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return list.sort((a, b) => (b.deal?.percent || 0) - (a.deal?.percent || 0));
    }
};

/** Customer page for one offer: hero, countdown and its products. */
const OfferDetail = () => {
    const { slug } = useParams();
    // Result of the last fetch, tagged with its slug; it is loading while
    // the URL's slug hasn't been fetched yet.
    const [result, setResult] = useState({ slug: null, offer: null, error: "" });
    const [sort, setSort] = useState("discount");
    const loading = result.slug !== slug;
    const { offer, error } = result;

    useEffect(() => {
        let cancelled = false;
        axios
            .get(API_ENDPOINTS.OFFER_DETAIL(slug))
            .then(({ data }) => !cancelled && setResult({ slug, offer: data, error: "" }))
            .catch((err) =>
                !cancelled &&
                setResult({
                    slug,
                    offer: null,
                    error: err.response?.status === 404 ? "This offer doesn't exist." : "Couldn't load this offer.",
                }),
            );
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const products = useMemo(() => sortProducts(offer?.products || [], sort), [offer, sort]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f4f4f4]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#f4f4f4] px-4 text-center">
                <p className="text-lg font-black text-secondary uppercase italic tracking-tighter">{error || "Offer not found"}</p>
                <Link to="/offers" className="text-sm font-black text-primary uppercase tracking-widest hover:underline">
                    See all offers
                </Link>
            </div>
        );
    }

    const isLive = offer.status === "live";

    return (
        <div className="bg-[#f4f4f4] min-h-screen pb-16">
            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: offerGradient(offer) }}>
                {offer.bannerImage && (
                    <>
                        <img src={offer.bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
                    </>
                )}
                <div className="relative max-w-7xl mx-auto px-[4%] md:px-4 py-10 md:py-16 text-white">
                    <Link
                        to="/offers"
                        className="flex w-fit items-center gap-1 text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white mb-6">
                        <ArrowLeft size={14} /> All offers
                    </Link>
                    <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                        <Tag size={13} /> {offerHeadline(offer)}
                    </span>
                    <h1 className="mt-4 text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none max-w-3xl drop-shadow">
                        {offer.title}
                    </h1>
                    {offer.subtitle && (
                        <p className="mt-3 text-base md:text-lg font-bold text-white/90 max-w-2xl">{offer.subtitle}</p>
                    )}
                    {offer.description && (
                        <p className="mt-2 text-sm text-white/75 max-w-2xl whitespace-pre-line">{offer.description}</p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        {isLive && <DealCountdown endsAt={offer.endDate} variant="light" showOpenEnded />}
                        {isLive && (
                            <span className="text-xs font-black uppercase tracking-widest text-white/80">
                                {products.length} product{products.length === 1 ? "" : "s"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6 md:py-8">
                {!isLive ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
                        <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                            {offer.status === "upcoming" ? "This offer starts soon" : "This offer has ended"}
                        </h2>
                        {offer.status === "upcoming" && offer.startDate && (
                            <p className="text-sm text-gray-500 mt-2">
                                Starts {new Date(offer.startDate).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                        )}
                        <Link
                            to="/offers"
                            className="inline-block mt-6 bg-secondary text-white font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl hover:bg-opacity-90">
                            See live offers
                        </Link>
                    </div>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 font-bold py-16">No products in this offer right now.</p>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                <Flame size={16} className="text-primary" /> Deals in this offer
                            </h2>
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Sort
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-secondary normal-case tracking-normal focus:outline-none focus:border-primary">
                                    {SORTS.map((s) => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OfferDetail;
