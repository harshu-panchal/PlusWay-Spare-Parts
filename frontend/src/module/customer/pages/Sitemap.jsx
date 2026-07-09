import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Map, Search, ChevronRight } from "lucide-react";

const Sitemap = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const siteStructure = [
    {
      category: "Shop",
      links: [
        { name: "Home", path: "/" },
        { name: "Brand Selection", path: "/brand-selection" },
        { name: "Products", path: "/products" },
        { name: "Cart", path: "/cart" },
        { name: "Checkout", path: "/checkout" },
      ],
    },
    {
      category: "Account",
      links: [
        { name: "Login", path: "/login" },
        { name: "Sign Up", path: "/signup" },
        { name: "My Profile", path: "/profile" },
        { name: "My Orders", path: "/profile/orders" },
        { name: "Addresses", path: "/profile/addresses" },
        { name: "Settings", path: "/profile/settings" },
      ],
    },
    {
      category: "Support & Services",
      links: [
        { name: "Support Center", path: "/support" },
        { name: "Track Order", path: "/track-order" },
        { name: "Replacement Requests", path: "/replacement-requests" },
        { name: "Contact Us", path: "/contact" },
        { name: "How-To Manuals", path: "/how-to-manuals" },
      ],
    },
    {
      category: "Company Information",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Career with Us", path: "/career" },
        { name: "Mobile Directory", path: "/mobile-directory" },
      ],
    },
    {
      category: "Policies & Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy-policy" },
        { name: "Refund Policy", path: "/refund-policy" },
        { name: "Terms & Conditions", path: "/terms-conditions" },
        { name: "Warranty Policy", path: "/warranty" },
      ],
    },
  ];

  const filteredStructure = siteStructure
    .map((section) => ({
      ...section,
      links: section.links.filter((link) =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((section) => section.links.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Map className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Sitemap
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Browse all pages on plusway.in
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for a page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors font-medium shadow-md"
            />
          </div>
        </div>

        {/* Sitemap Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStructure.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-black text-secondary uppercase mb-4 pb-3 border-b-2 border-primary">
                {section.category}
              </h2>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="flex items-center justify-between group text-gray-700 hover:text-primary transition-colors py-2 px-3 rounded hover:bg-gray-50">
                      <span className="font-bold text-sm">{link.name}</span>
                      <ChevronRight
                        size={16}
                        className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {filteredStructure.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 font-medium">
              No pages found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Total Pages */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 font-medium">
            Total Pages:{" "}
            <span className="font-black text-secondary">
              {siteStructure.reduce(
                (total, section) => total + section.links.length,
                0,
              )}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
