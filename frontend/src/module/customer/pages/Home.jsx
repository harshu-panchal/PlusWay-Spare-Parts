import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import LazyImage from "../../../components/LazyImage";
import ProductCard from "../components/ProductCard";
import { usePageTranslation } from "../../../hooks/usePageTranslation";

// Static texts for translation
const STATIC_TEXTS = [
  "Select Mobile Phone Brand",
  "Recently Viewed",
];

const BannerWrapper = ({ banner, children }) => {
  if (!banner?.link) return children;
  if (banner.link.startsWith("http://") || banner.link.startsWith("https://")) {
    return (
      <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block w-full">
        {children}
      </a>
    );
  }
  return (
    <Link to={banner.link} className="block w-full">
      {children}
    </Link>
  );
};

const BrandGrid = ({ brands, t }) => (
  <div className="bg-white p-0 md:p-8 rounded shadow-sm border border-gray-100 mb-12">
    <h2 className="text-center text-xl font-black text-secondary mb-4 md:mb-8 py-4 md:py-0 uppercase tracking-tight">
      {t("Select Mobile Phone Brand")}
    </h2>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-px bg-gray-100 border border-gray-100">
      {brands.map((brand) => (
        <Link
          key={brand._id}
          to={`/products?brand=${brand._id}&deviceType=Mobile`}
          className="flex items-center justify-center p-6 bg-white hover:bg-gray-50 transition-colors aspect-square overflow-hidden">
          <LazyImage
            src={brand.logo}
            alt={brand.name}
            className="max-w-full max-h-full object-contain transition-all opacity-80 hover:opacity-100 duration-300"
          />
        </Link>
      ))}
    </div>
  </div>
);

const Home = () => {
  const { t, isTranslating } = usePageTranslation(STATIC_TEXTS);
  const [brands, setBrands] = useState([]);
  const [homeSections, setHomeSections] = useState([]);
  const [banners, setBanners] = useState({ main: [], sub: [] });
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [currentMainIndex, setCurrentMainIndex] = useState(0);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(history);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, bannersRes, sectionsRes] = await Promise.all([
          axios.get(`${API_ENDPOINTS.BRANDS}?all=true`),
          axios.get(API_ENDPOINTS.BANNERS),
          axios.get(API_ENDPOINTS.HOME_SECTIONS),
        ]);

        setBrands(brandsRes.data.brands || brandsRes.data || []);
        const bannersData = Array.isArray(bannersRes.data)
          ? bannersRes.data
          : [];
        setBanners({
          main: bannersData.filter((b) => b.type === "main"),
          sub: bannersData.filter((b) => b.type === "sub"),
        });
        setHomeSections(
          Array.isArray(sectionsRes.data) ? sectionsRes.data : [],
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const activeMainBanner = banners.main[currentMainIndex] || banners.main[0];
  const activeSubBanner = banners.sub[currentSubIndex] || banners.sub[0];

  return (
    <div className="bg-[#fcfcfc] pb-12">
      {/* Main Promotional Banner */}
      {banners.main.length > 0 && activeMainBanner && (
        <div className="max-w-7xl mx-auto px-0 md:px-4 py-4">
          <div className="relative group w-full rounded shadow-sm overflow-hidden bg-white">
            <BannerWrapper banner={activeMainBanner}>
              <LazyImage
                src={activeMainBanner.image}
                alt="Promotion"
                className="w-full h-auto"
              />
            </BannerWrapper>
            {banners.main.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentMainIndex((prev) =>
                      prev === 0 ? banners.main.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-10">
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() =>
                    setCurrentMainIndex((prev) =>
                      prev === banners.main.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors z-10">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sub-Banner / Search Visual */}
      {banners.sub.length > 0 && activeSubBanner && (
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 mb-12">
          <div className="relative group">
            <BannerWrapper banner={activeSubBanner}>
              <LazyImage
                src={activeSubBanner.image}
                alt="Search Banner"
                className="w-full h-auto rounded shadow-sm"
              />
            </BannerWrapper>
            {banners.sub.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center z-10">
                  <button
                    onClick={() =>
                      setCurrentSubIndex((prev) =>
                        prev === 0 ? banners.sub.length - 1 : prev - 1
                      )
                    }
                    className="bg-black/10 p-2 text-white hover:bg-black/30 transition-colors rounded-r">
                    <ChevronLeft size={24} />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center z-10">
                  <button
                    onClick={() =>
                      setCurrentSubIndex((prev) =>
                        prev === banners.sub.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="bg-black/10 p-2 text-white hover:bg-black/30 transition-colors rounded-l">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Home Sections */}
      {Array.isArray(homeSections) &&
        homeSections.map((section) => (
          <div
            key={section._id}
            className="max-w-7xl mx-auto px-[2%] md:px-4 mb-6">
            <div className="bg-gray-50 px-4 py-3 border-b-2 border-primary">
              <Link
                to={`/section/${section._id}`}
                className="inline-flex items-center gap-2 group">
                <h2 className="text-sm font-black text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
                  View all
                </span>
              </Link>
            </div>
          </div>
        ))}

      {/* Brands Selection */}
      <div className="max-w-7xl mx-auto px-[2%] md:px-4">
        <BrandGrid brands={Array.isArray(brands) ? brands : []} t={t} />
      </div>

      {/* Recently Viewed Block (Mock) */}
      {/* Recently Viewed Block */}
      {Array.isArray(recentlyViewed) && recentlyViewed.length > 0 && (
        <div className="max-w-7xl mx-auto px-[2%] md:px-4">
          <div className="bg-gray-50 px-4 py-3 border-b-2 border-primary mb-6">
            <h2 className="text-sm font-black text-secondary uppercase tracking-widest">
              {t("Recently Viewed")}
            </h2>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-[2%] px-[2%] md:mx-0 md:px-0 scroll-smooth">
            {recentlyViewed.map((item) => (
              <div
                key={item._id}
                className="w-[150px] md:w-[240px] flex-shrink-0">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
