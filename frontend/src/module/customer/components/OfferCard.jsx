import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";
import LazyImage from "../../../components/LazyImage";
import DealCountdown from "./DealCountdown";
import { offerGradient, offerHeadline } from "../../../utils/offers";

/**
 * Offer tile for the Offers page: cover image (or accent gradient), headline
 * badge, title, countdown and a strip of product thumbnails.
 */
const OfferCard = ({ offer }) => {
    const thumbs = (offer.previewProducts || [])
        .map((p) => p.images?.[0])
        .filter(Boolean)
        .slice(0, 4);

    return (
        <Link
            to={`/offers/${offer.slug}`}
            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div
                className="relative aspect-[16/9] overflow-hidden"
                style={offer.bannerImage ? undefined : { background: offerGradient(offer) }}>
                {offer.bannerImage ? (
                    <LazyImage
                        src={offer.bannerImage}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <p className="text-white text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-center leading-none drop-shadow">
                            {offerHeadline(offer)}
                        </p>
                    </div>
                )}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
                    <Tag size={12} /> {offerHeadline(offer)}
                </span>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                    <h3 className="text-lg font-black text-secondary uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors">
                        {offer.title}
                    </h3>
                    {offer.subtitle && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.subtitle}</p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <DealCountdown endsAt={offer.endDate} />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {offer.productCount} product{offer.productCount === 1 ? "" : "s"}
                    </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div className="flex -space-x-2">
                        {thumbs.map((src, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white overflow-hidden shadow-sm">
                                <LazyImage src={src} alt="" className="w-full h-full object-contain p-1" />
                            </div>
                        ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-primary uppercase tracking-widest">
                        Shop now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default OfferCard;
