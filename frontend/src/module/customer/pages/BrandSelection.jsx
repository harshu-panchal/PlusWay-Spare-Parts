import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";

import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import LazyImage from "../../../components/LazyImage";

const BrandSelection = () => {
  const [searchParams] = useSearchParams();
  const deviceTypeParam = searchParams.get("deviceType") || searchParams.get("type") || "Mobile";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axios.get(`${API_ENDPOINTS.BRANDS}?all=true`);
        setBrands(data.brands || data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching brands", error);
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((b) => {
    const matchesSearch = b.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLetter = selectedLetter
      ? b.name.toUpperCase().startsWith(selectedLetter)
      : true;
    return matchesSearch && matchesLetter;
  });

  return (
    <div className="bg-[#f4f4f4] min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">All Brands</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-8">
        {/* Suggestions Section */}
        {/* Suggestions Section - Placeholder or Removed */}

        {/* Search Brand Section */}
        <div className="mb-12 bg-white p-8 rounded shadow-sm border border-gray-100 text-center">
          <h1 className="text-2xl font-black text-secondary mb-6 uppercase tracking-tight">
            Select Mobile Phone Brand
          </h1>
          <div className="max-w-2xl mx-auto relative flex items-center">
            <input
              type="text"
              placeholder="Search your handset brand"
              className="w-full h-12 px-4 border-2 border-primary rounded text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-primary hover:bg-orange-600 text-white p-3 rounded-r absolute right-0 flex items-center justify-center transition-colors">
              <Search size={22} />
            </button>
          </div>
        </div>

        {/* Brand Logo Grid */}
        {/* Brand Logo Grid */}
        {loading ? (
          <div className="text-center py-20">Loading brands...</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-px bg-gray-200 border border-gray-200 mb-12">
            {filteredBrands.map((brand) => (
              <Link
                key={brand._id}
                to={
                  deviceTypeParam?.toLowerCase() === "mobile"
                    ? `/products?brand=${brand._id}&deviceType=Mobile`
                    : `/brand/${brand._id}/models?deviceType=${encodeURIComponent(deviceTypeParam)}`
                }
                className="bg-white p-6 flex items-center justify-center h-40 hover:bg-gray-50 transition-colors group relative flex-col gap-2">
                <LazyImage
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-[80px] object-contain transition-all duration-300 transform group-hover:scale-110"
                />
                <span className="text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Alphabet Search */}
        <div className="bg-white p-8 rounded shadow-sm border border-gray-100 text-center mb-12">
          <h3 className="text-lg font-bold text-secondary mb-6 uppercase tracking-tight">
            Search Brand By Starting Alphabet
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {alphabets.map((char) => (
              <button
                key={char}
                onClick={() =>
                  setSelectedLetter(selectedLetter === char ? null : char)
                }
                className={`w-8 h-8 flex items-center justify-center border font-bold transition-all rounded ${
                  selectedLetter === char
                    ? "bg-primary text-white border-primary"
                    : "border-gray-200 text-blue-600 hover:bg-primary hover:text-white hover:border-primary"
                }`}>
                {char}
              </button>
            ))}
          </div>
          {selectedLetter && (
            <button
              onClick={() => setSelectedLetter(null)}
              className="mt-4 text-sm text-blue-600 underline font-bold">
              Clear Filter
            </button>
          )}
        </div>

        {/* Request New Brand */}
        <div className="text-center mb-12 text-sm text-gray-600">
          Not able to search the brand you are looking for in our website?
          Request new Brand / Model
          <Link
            to="/request-new"
            className="text-blue-600 font-bold hover:underline ml-1">
            here
          </Link>
          .
        </div>

        {/* How to Search Guide */}
        <div className="mb-12 bg-white p-8 rounded shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-secondary mb-10 text-center uppercase tracking-tight italic">
            How to Search for your product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-28 flex items-center justify-center mb-4">
                <LazyImage
                  src="https://www.plusway.in/temp/images/search_v3/brand_search.jpg"
                  alt="Select Brand"
                  className="max-h-full object-contain opacity-80"
                />
              </div>
              <h3 className="text-lg font-black text-secondary uppercase mb-3">
                1. Select Brand
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                Select the brand of the handset for which you are looking
                products for. If your brand is not listed, then search using the
                search box or click on the brand starting alphabet.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-28 flex items-center justify-center mb-4">
                <LazyImage
                  src="https://www.plusway.in/temp/images/search_v3/model_search.jpg"
                  alt="Select Model"
                  className="max-h-full object-contain opacity-80"
                />
              </div>
              <h3 className="text-lg font-black text-secondary uppercase mb-3">
                2. Select Model
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                After selecting the brand, you now need to select the model of
                the handset. If your model is not listed, then search using the
                search box.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-28 flex items-center justify-center mb-4">
                <LazyImage
                  src="https://www.plusway.in/temp/images/search_v3/part_search.jpg"
                  alt="Select Part"
                  className="max-h-full object-contain opacity-80"
                />
              </div>
              <h3 className="text-lg font-black text-secondary uppercase mb-3">
                3. Select Product Type
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                You can now see all type of products which are available for
                your handset. You can now select the product type which you are
                looking details for.
              </p>
            </div>
          </div>
        </div>

        {/* Best Sellers & New Additions */}
        {/* Best Sellers & New Additions - Placeholder or Removed */}
      </div>
    </div>
  );
};

export default BrandSelection;
