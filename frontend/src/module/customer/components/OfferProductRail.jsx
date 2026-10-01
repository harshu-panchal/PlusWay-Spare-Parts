import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import ProductCard from "./ProductCard";
import DealCountdown from "./DealCountdown";
import { offerGradient, offerHeadline } from "../../../utils/offers";

/**
 * One offer as a horizontal strip: coloured header (title, headline,
 * countdown, "View all") and a scrollable row of its products.
 */
const OfferProductRail = ({ offer }) => {
    const products = offer.previewProducts || [];
    if (products.length === 0) return null;

    return (
        <section className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
            <div
                className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-4 text-white"
                style={{ background: offerGradient(offer) }}>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-white/15 flex items-center justify-center">
                        <Flame size={20} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base md:text-lg font-black uppercase italic tracking-tighter leading-tight truncate">
                            {offer.title}
                        </h2>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                            {offerHeadline(offer)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <DealCountdown endsAt={offer.endDate} variant="light" />
                    <Link
                        to={`/offers/${offer.slug}`}
                        className="inline-flex items-center gap-1 bg-white text-secondary text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        View all <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto p-4 md:p-5 scroll-smooth">
                {products.map((product) => (
                    <div key={product._id} className="w-[150px] md:w-[220px] flex-shrink-0">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default OfferProductRail;
