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
  "No Promo Banner",
  "No Sub Banner",
  "Recently Viewed",
];

const BrandGrid = ({ brands, t }) => (
  <div className="bg-white p-0 md:p-8 rounded shadow-sm border border-gray-100 mb-12">
    <h2 className="text-center text-xl font-black text-secondary mb-4 md:mb-8 py-4 md:py-0 uppercase tracking-tight">
      {t("Select Mobile Phone Brand")}
    </h2>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-px bg-gray-100 border border-gray-100">
      {brands.map((brand) => (
        <Link
          key={brand._id}
          to={`/brand/${brand._id}/models`}
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
  return (
    <div className="bg-[#fcfcfc] pb-12">
      {/* Main Promotional Banner */}
      {/* Main Promotional Banner */}
      <div className="max-w-7xl mx-auto px-0 md:px-4 py-4">
        <div className="w-full rounded shadow-sm overflow-hidden bg-white">
          {banners.main.length > 0 ? (
            <LazyImage
              src={banners.main[0].image}
              alt="Promotion"
              className="w-full h-auto"
            />
          ) : (
            <div className="h-[300px] bg-gray-100 flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
              {t("No Promo Banner")}
            </div>
          )}
        </div>
      </div>

      {/* Sub-Banner / Search Visual */}
      {/* Sub-Banner / Search Visual */}
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 mb-12">
        <div className="relative group">
          {banners.sub.length > 0 ? (
            <LazyImage
              src={banners.sub[0].image}
              alt="Search Banner"
              className="w-full h-auto rounded shadow-sm"
            />
          ) : (
            <div className="h-[200px] bg-gray-100 rounded shadow-sm flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest">
              {t("No Sub Banner")}
            </div>
          )}
          <div className="absolute inset-y-0 left-0 flex items-center">
            <button className="bg-black/10 p-2 text-white hover:bg-black/30 transition-colors rounded-r">
              <ChevronLeft size={24} />
            </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button className="bg-black/10 p-2 text-white hover:bg-black/30 transition-colors rounded-l">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

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
