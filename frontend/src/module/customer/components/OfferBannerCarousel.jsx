import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LazyImage from "../../../components/LazyImage";

const AUTO_ADVANCE_MS = 5000;

// Banner image wrapped in its link: external URLs open in a new tab
const BannerLink = ({ banner, children }) => {
    if (!banner.link) return children;
    if (/^https?:\/\//.test(banner.link)) {
        return (
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {children}
            </a>
        );
    }
    return (
        <Link to={banner.link} className="block w-full h-full">
            {children}
        </Link>
    );
};

/**
 * Auto-advancing banner carousel for the Offers page (banners of type
 * "offer", managed in Admin → Offers & Deals → Offer Page Banners).
 */
const OfferBannerCarousel = ({ banners = [] }) => {
    const [index, setIndex] = useState(0);
    const count = banners.length;

    useEffect(() => {
        if (count < 2) return undefined;
        const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS);
        return () => clearInterval(timer);
    }, [count]);

    if (count === 0) return null;
    const active = banners[index % count];
    const go = (delta) => setIndex((i) => (i + delta + count) % count);

    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-gray-100 shadow-sm group">
            <div className="aspect-[3/1] md:aspect-[4/1]">
                <BannerLink banner={active}>
                    <LazyImage src={active.image} alt="Offer banner" className="w-full h-full object-cover" />
                </BannerLink>
            </div>

            {count > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous banner"
                        onClick={() => go(-1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-secondary flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        aria-label="Next banner"
                        onClick={() => go(1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-secondary flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                        <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {banners.map((banner, i) => (
                            <button
                                key={banner._id || i}
                                type="button"
                                aria-label={`Show banner ${i + 1}`}
                                onClick={() => setIndex(i)}
                                className={`h-2 rounded-full transition-all ${i === index % count ? "w-6 bg-white" : "w-2 bg-white/60"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default OfferBannerCarousel;
