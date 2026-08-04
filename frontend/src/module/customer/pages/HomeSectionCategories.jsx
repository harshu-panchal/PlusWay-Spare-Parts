import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import axios from "axios";

import { API_ENDPOINTS } from "../../../config/api";
import LazyImage from "../../../components/LazyImage";
import ProductCard from "../components/ProductCard";
import { formatReleasedDate } from "../../../utils/formatReleasedDate";

const getGridColsClass = (num) => {
  const n = num || 4;
  switch (n) {
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-3";
    case 4:
      return "lg:grid-cols-4";
    case 5:
      return "lg:grid-cols-5";
    case 6:
      return "lg:grid-cols-6";
    case 7:
      return "lg:grid-cols-7";
    case 8:
      return "lg:grid-cols-8";
    case 9:
      return "lg:grid-cols-9";
    case 10:
      return "lg:grid-cols-10";
    default:
      return "lg:grid-cols-4";
  }
};

const SectionItemCard = ({ item, displayType, filterDeviceType }) => {
  switch (displayType) {
    case "brands":
      return (
        <Link
          to={`?brandId=${item._id}`}
          className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden">
          <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
            <LazyImage
              src={item.logo}
              alt={item.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
            <h2 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h2>
          </div>
        </Link>
      );
    case "models":
      return (
        <Link
          to={`/model/${item._id}/products`}
          className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden">
          <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
            <LazyImage
              src={item.image || item.brand?.logo}
              alt={item.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
            <h2 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h2>
            {item.released && (
              <p className="text-[10px] font-medium text-gray-400 mt-1">
                {formatReleasedDate(item.released)}
              </p>
            )}
          </div>
        </Link>
      );
    case "products":
      return <ProductCard product={item} />;
    case "categories":
    default:
      return (
        <Link
          to={`/products?category=${item._id}`}
          className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden">
          <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
            <LazyImage
              src={item.image}
              alt={item.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
            <h2 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {item.name}
            </h2>
          </div>
        </Link>
      );
  }
};

const HomeSectionCategories = () => {
  const { sectionId } = useParams();
  const [searchParams] = useSearchParams();
  const brandId = searchParams.get("brandId");

  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBrands, setAllBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        setLoading(true);
        const [sectionsRes, brandsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.HOME_SECTIONS),
          axios.get(`${API_ENDPOINTS.BRANDS}?all=true`),
        ]);

        const sections = Array.isArray(sectionsRes.data) ? sectionsRes.data : [];
        const selectedSection = sections.find((item) => item._id === sectionId);
        setSection(selectedSection || null);

        const fetchedBrands = brandsRes.data?.brands || brandsRes.data || [];
        setAllBrands(Array.isArray(fetchedBrands) ? fetchedBrands : []);
      } catch (error) {
        console.error("Error fetching section data:", error);
        setSection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [sectionId]);

  useEffect(() => {
    if (!brandId) return;
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data } = await axios.get(
          `${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`
        );
        setCategories(data.categories || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-[#f4f4f4]">
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <h1 className="text-2xl font-black text-secondary uppercase mb-3">
              Section Not Found
            </h1>
            <p className="text-gray-500 mb-6">
              This section is unavailable or no longer active.
            </p>
            <Link to="/" className="text-primary font-bold hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayType = section.displayType || "categories";
  const isBrandsFlow =
    displayType === "brands" ||
    sectionId === "697bb8dac051a68bc83e4dc8" ||
    section.title?.toLowerCase().includes("spare parts") ||
    section.title?.toLowerCase().includes("spare");

  const sectionCategories = Array.isArray(section.categories) ? section.categories : [];
  const brandsList =
    isBrandsFlow
      ? sectionCategories.length > 0 && displayType === "brands"
        ? sectionCategories
        : allBrands
      : [];

  const selectedBrand = brandId
    ? allBrands.find((b) => b._id === brandId) ||
      sectionCategories.find((b) => b._id === brandId)
    : null;
  const selectedBrandName = selectedBrand?.name || "Brand";

  // Step 2: User selected a brand, now show categories for that brand
  if (isBrandsFlow && brandId) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] pb-12">
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link to={`/section/${sectionId}`} className="hover:text-primary uppercase">
              {section.title}
            </Link>
            <ChevronRight size={12} />
            <span className="uppercase text-secondary font-bold">
              {selectedBrandName}
            </span>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-b-2 border-primary mb-6 flex items-center justify-between">
            <h1 className="text-sm font-black text-secondary uppercase tracking-widest">
              Select Category for {selectedBrandName}
            </h1>
            <Link
              to={`/section/${sectionId}`}
              className="text-xs font-bold text-primary hover:underline">
              ← Change Brand
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="py-12 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 font-semibold">
              No categories available.
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${getGridColsClass(section.productsPerRow)} gap-4`}>
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?brand=${brandId}&category=${category._id}`}
                  className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden">
                  <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
                    <LazyImage
                      src={category.image}
                      alt={category.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
                    <h2 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {category.name}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 1: Brands flow (Shows Brands)
  if (isBrandsFlow) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] pb-12">
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="uppercase">{section.title}</span>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-b-2 border-primary mb-6">
            <h1 className="text-sm font-black text-secondary uppercase tracking-widest">
              {section.title} Brands
            </h1>
          </div>

          {brandsList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 font-semibold">
              No brands available for this section.
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${getGridColsClass(section.productsPerRow)} gap-4`}>
              {brandsList.map((brand) => (
                <Link
                  key={brand._id}
                  to={`?brandId=${brand._id}`}
                  className="bg-white rounded-2xl border border-gray-200/70 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col overflow-hidden">
                  <div className="w-full aspect-[4/5] p-6 bg-[#f8fafc] flex items-center justify-center relative overflow-hidden">
                    <LazyImage
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-full bg-white py-3.5 px-3 border-t border-gray-100 flex flex-col items-center justify-center shrink-0">
                    <h2 className="text-center font-bold text-xs md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {brand.name}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback for non-brands section (categories / models / products)
  const typeLabel =
    displayType === "models"
      ? "Models"
      : displayType === "products"
        ? "Products"
        : "Categories";

  return (
    <div className="min-h-screen bg-[#f4f4f4] pb-12">
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="uppercase">{section.title}</span>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-b-2 border-primary mb-6">
          <h1 className="text-sm font-black text-secondary uppercase tracking-widest">
            {section.title} {typeLabel}
          </h1>
        </div>

        {sectionCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 font-semibold">
            No {typeLabel.toLowerCase()} configured for this section.
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${getGridColsClass(section.productsPerRow)} gap-4`}>
            {sectionCategories.map((item) => (
              <SectionItemCard
                key={item._id}
                item={item}
                displayType={displayType}
                filterDeviceType={section.filterDeviceType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSectionCategories;
