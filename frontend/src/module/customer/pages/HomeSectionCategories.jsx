import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

const SectionItemCard = ({ item, displayType }) => {
  switch (displayType) {
    case "brands":
      return (
        <Link
          to={`/brand/${item._id}/models`}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary transition-all group flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3 overflow-hidden relative shrink-0 flex items-center justify-center">
            <LazyImage
              src={item.logo}
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h2 className="text-center font-bold text-[11px] text-secondary uppercase leading-tight group-hover:text-primary tracking-tight">
            {item.name}
          </h2>
        </Link>
      );
    case "models":
      return (
        <Link
          to={`/model/${item._id}/products`}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary transition-all group flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3 overflow-hidden relative shrink-0">
            <LazyImage
              src={item.image || item.brand?.logo}
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h2 className="text-center font-bold text-[11px] text-secondary uppercase leading-tight group-hover:text-primary tracking-tight">
            {item.name}
          </h2>
          {item.released && (
            <p className="text-[10px] text-gray-500 mt-1">
              {formatReleasedDate(item.released)}
            </p>
          )}
        </Link>
      );
    case "products":
      return <ProductCard product={item} />;
    case "categories":
    default:
      return (
        <Link
          to={`/products?category=${item._id}`}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-primary transition-all group flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-3 overflow-hidden relative shrink-0">
            <LazyImage
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <h2 className="text-center font-bold text-[11px] text-secondary uppercase leading-tight group-hover:text-primary tracking-tight">
            {item.name}
          </h2>
        </Link>
      );
  }
};

const HomeSectionCategories = () => {
  const { sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_ENDPOINTS.HOME_SECTIONS);
        const sections = Array.isArray(data) ? data : [];
        const selectedSection = sections.find((item) => item._id === sectionId);
        setSection(selectedSection || null);
      } catch (error) {
        console.error("Error fetching home section:", error);
        setSection(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSection();
  }, [sectionId]);

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
  const sectionItems = Array.isArray(section.categories) ? section.categories : [];
  const typeLabel =
    displayType === "brands"
      ? "Brands"
      : displayType === "models"
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

        {sectionItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-500 font-semibold">
            No {typeLabel.toLowerCase()} configured for this section.
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${getGridColsClass(section.productsPerRow)} gap-4`}>
            {sectionItems.map((item) => (
              <SectionItemCard
                key={item._id}
                item={item}
                displayType={displayType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSectionCategories;
