import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  Phone,
  ChevronDown,
  ChevronRight,
  Send,
  X,
  Tag,
  Package,
  LogOut,
  LogIn,
  UserPlus,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import LanguageSelector from "../../../components/LanguageSelector";
import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../context/CartContext";
import { API_ENDPOINTS } from "../../../config/api";
import { formatReleasedDate } from "../../../utils/formatReleasedDate";

import axios from "axios";

const EMPTY_SEARCH_RESULTS = { models: [], products: [] };

const SearchDropdown = ({
  results,
  loading,
  onSelectModel,
  onSelectProduct,
}) => {
  const hasModels = results.models.length > 0;
  const hasProducts = results.products.length > 0;

  if (loading) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
        Searching…
      </div>
    );
  }

  if (!hasModels && !hasProducts) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
        No matching products or models
      </div>
    );
  }

  return (
    <>
      {hasModels && (
        <div>
          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Models
          </div>
          {results.models.map((model) => (
            <button
              key={model._id}
              type="button"
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
              onClick={() => onSelectModel(model)}
            >
              {model.image ? (
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-8 h-10 object-contain shrink-0"
                />
              ) : (
                <div className="w-8 h-10 bg-gray-100 flex items-center justify-center rounded shrink-0">
                  <Package size={16} className="text-gray-400" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {model.name}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {model.brand?.name ? `${model.brand.name}` : "Model"}
                  {model.released
                    ? ` · ${formatReleasedDate(model.released)}`
                    : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasProducts && (
        <div>
          <div className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Products
          </div>
          {results.products.map((product) => (
            <button
              key={product._id}
              type="button"
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
              onClick={() => onSelectProduct(product)}
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-8 h-10 object-contain shrink-0"
                />
              ) : (
                <div className="w-8 h-10 bg-gray-100 flex items-center justify-center rounded shrink-0">
                  <Tag size={16} className="text-gray-400" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {product.name}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {product.model?.name || product.brand?.name || "Product"}
                  {product.code ? ` · ${product.code}` : ""}
                  {product.price ? ` · ₹${product.price}` : ""}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState(EMPTY_SEARCH_RESULTS);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDropdownRef = useRef(null);
  const mobileSearchDropdownRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const searchRequestRef = useRef(0);
  const categoriesMenuRef = useRef(null);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`,
        );
        setCategories(data.categories || (Array.isArray(data) ? data : []));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Body scroll-lock + ESC-to-close while the mobile drawer is open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close the desktop "All Categories" dropdown on outside-click / ESC.
  useEffect(() => {
    if (!isCategoriesMenuOpen) return;
    const onClickAway = (e) => {
      if (
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(e.target)
      ) {
        setIsCategoriesMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsCategoriesMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onKey);
    };
  }, [isCategoriesMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    closeMobileMenu();
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      closeMobileMenu();
      setIsSearchDropdownOpen(false);
      navigate(`/products?keyword=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelectModel = (model) => {
    setIsSearchDropdownOpen(false);
    closeMobileMenu();
    setSearchQuery(model.name);
    navigate(`/model/${model._id}/products`);
  };

  const handleSelectProduct = (product) => {
    setIsSearchDropdownOpen(false);
    closeMobileMenu();
    setSearchQuery(product.name);
    navigate(`/product/${product._id}`);
  };

  const runWildSearch = async (trimmed) => {
    const requestId = ++searchRequestRef.current;
    setIsSearchLoading(true);
    try {
      const { data } = await axios.get(
        `${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(trimmed)}&limit=5`,
      );
      if (requestId !== searchRequestRef.current) return;
      setSearchResults({
        models: data.models || [],
        products: data.products || [],
      });
      setIsSearchDropdownOpen(true);
    } catch (error) {
      if (requestId !== searchRequestRef.current) return;
      console.error("Error searching:", error);
      setSearchResults(EMPTY_SEARCH_RESULTS);
      setIsSearchDropdownOpen(false);
    } finally {
      if (requestId === searchRequestRef.current) {
        setIsSearchLoading(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    const trimmed = value.trim();

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (trimmed.length < 2) {
      searchRequestRef.current += 1;
      setSearchResults(EMPTY_SEARCH_RESULTS);
      setIsSearchDropdownOpen(false);
      setIsSearchLoading(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      runWildSearch(trimmed);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    if (!isSearchDropdownOpen) return;
    const onClickAway = (e) => {
      const desktopContains =
        searchDropdownRef.current &&
        searchDropdownRef.current.contains(e.target);
      const mobileContains =
        mobileSearchDropdownRef.current &&
        mobileSearchDropdownRef.current.contains(e.target);
      if (
        !desktopContains &&
        !mobileContains
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickAway);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
    };
  }, [isSearchDropdownOpen]);

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartCount = safeCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = safeCartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Top Banner/Info */}
      <div className="bg-gray-100 py-1.5 px-4 text-[11px] flex justify-between items-center hidden md:flex border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full flex justify-between">
          <div className="flex items-center gap-4 text-gray-600 font-medium">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-primary" /> Support: +91
              9599197756
            </span>
          </div>
          <div className="flex gap-4 text-gray-600 font-medium uppercase tracking-wider items-center">
            <Link
              to="/profile"
              className="hover:text-primary transition-colors">
              Orders
            </Link>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Replacement Requests
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer">
              Plusway Support
            </span>
            <span className="text-gray-300">|</span>
            <LanguageSelector
              variant="compact"
              showFlag={true}
              showNative={false}
            />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-[2%] md:px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="h-10 md:h-12 flex items-center bg-secondary px-4 rounded text-white font-black italic tracking-tighter text-xl">
            PLUSWAY
          </div>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative hidden md:block group" ref={searchDropdownRef}>
          <input
            type="text"
            placeholder="Search Plusway.com"
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary transition-all text-sm font-medium bg-white"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearch}
          />
          <button
            onClick={handleSearch}
            className="absolute right-0 top-0 h-full px-4 bg-gray-50 border-l border-gray-300 rounded-r hover:bg-gray-100 transition-colors">
            <Search size={18} className="text-gray-500" />
          </button>
          
          {/* Dropdown */}
          {isSearchDropdownOpen && searchQuery.trim().length >= 2 && (
            <div
              className="absolute left-0 top-full mt-1 w-full bg-white rounded shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-[60]"
            >
              <SearchDropdown
                results={searchResults}
                loading={isSearchLoading}
                onSelectModel={handleSelectModel}
                onSelectProduct={handleSelectProduct}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Account Dropdown */}
          <div className="relative group/account hidden md:block">
            <div
              className="flex items-center gap-1 cursor-pointer group"
              onMouseEnter={() => setIsAccountOpen(true)}
              onClick={() => navigate(userInfo ? "/profile" : "/login")}>
              <User
                size={22}
                className="text-gray-600 group-hover:text-primary transition-colors"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500 leading-none">
                  {userInfo
                    ? `Hi, ${userInfo.name.split(" ")[0]}`
                    : "My Account"}
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[11px] font-bold text-secondary">
                    {userInfo ? "Profile" : "Sign In"}
                  </span>
                  <ChevronDown
                    size={10}
                    className="text-gray-400 group-hover:text-primary"
                  />
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full pt-4 w-64 opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-200">
              <div className="bg-white rounded shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col gap-2">
                  {!userInfo ? (
                    <>
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-primary text-white font-black py-2 rounded text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate("/signup")}
                        className="w-full bg-white border border-gray-300 text-secondary font-black py-2 rounded text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">
                        Register
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-500 text-white font-black py-2 rounded text-xs uppercase tracking-widest hover:bg-red-600 transition-colors">
                      Logout
                    </button>
                  )}
                </div>
                <ul className="py-2 text-[12px] font-bold text-gray-600">
                  <li>
                    <Link
                      to="/profile"
                      className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50">
                      Orders{" "}
                      <ChevronDown
                        size={12}
                        className="-rotate-90 text-gray-300"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/replacement-requests"
                      className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50">
                      Replacement Requests{" "}
                      <ChevronDown
                        size={12}
                        className="-rotate-90 text-gray-300"
                      />
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/support"
                      className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between">
                      Plusway Support{" "}
                      <ChevronDown
                        size={12}
                        className="-rotate-90 text-gray-300"
                      />
                    </Link>
                  </li>
                </ul>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    Track my order(s)
                  </p>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      placeholder="Order ID/Email"
                      className="flex-1 text-[11px] border border-gray-300 rounded p-1.5 focus:outline-none"
                    />
                    <button className="bg-secondary text-white px-3 py-1.5 rounded text-[11px] font-black hover:bg-black transition-colors">
                      GO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <Link to="/cart" className="hidden md:flex items-center gap-2 group">
            <div className="relative">
              <ShoppingCart
                size={24}
                className="text-gray-600 group-hover:text-primary transition-colors"
              />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] uppercase font-black text-gray-500 leading-none">
                Your Cart
              </span>
              <span className="text-[11px] font-bold text-secondary">
                ₹{cartTotal.toLocaleString()}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            className="md:hidden text-secondary p-1 -mr-1 rounded hover:bg-gray-100 transition-colors">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-[2%] pb-3" ref={mobileSearchDropdownRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search Plusway.com"
            className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-all text-sm font-medium bg-white"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearch}
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <button
            onClick={handleSearch}
            className="absolute right-0 top-0 h-full px-4 bg-gray-50 border-l border-gray-300 rounded-r hover:bg-gray-100 transition-colors"
          >
            <Send size={16} className="text-gray-500" />
          </button>

          {isSearchDropdownOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white rounded shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-[60]">
              <SearchDropdown
                results={searchResults}
                loading={isSearchLoading}
                onSelectModel={handleSelectModel}
                onSelectProduct={handleSelectProduct}
              />
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────── Mobile Drawer ──────────────────── */}
      {/* Backdrop */}
      <div
        onClick={closeMobileMenu}
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />
      {/* Drawer panel — slides in from the right */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className={`md:hidden fixed top-0 right-0 h-dvh w-[88%] max-w-88 bg-white shadow-2xl z-70 flex flex-col transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-secondary text-white">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center bg-primary px-3 py-1 rounded text-white font-black italic tracking-tighter text-lg">
            PLUSWAY
          </Link>
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
            className="p-2 -mr-2 rounded hover:bg-white/10 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Account block */}
          <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
            {userInfo ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-black flex items-center justify-center text-sm uppercase shrink-0">
                  {userInfo.name?.[0] || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase font-black text-gray-500 leading-none">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-secondary truncate mt-0.5">
                    {userInfo.name}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="text-[11px] font-black uppercase tracking-widest text-primary hover:underline shrink-0">
                  View
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { closeMobileMenu(); navigate("/login"); }}
                  className="flex items-center justify-center gap-1.5 bg-primary text-white font-black py-2.5 rounded text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-colors">
                  <LogIn size={14} /> Sign In
                </button>
                <button
                  onClick={() => { closeMobileMenu(); navigate("/signup"); }}
                  className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-secondary font-black py-2.5 rounded text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-colors">
                  <UserPlus size={14} /> Register
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Plusway.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-all text-sm font-medium bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearch}
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              {/* Dropdown for Mobile */}
              {isSearchDropdownOpen && searchQuery.trim().length >= 2 && (
                <div
                  className="absolute left-0 top-full mt-1 w-full bg-white rounded shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-[60]"
                >
                  <SearchDropdown
                    results={searchResults}
                    loading={isSearchLoading}
                    onSelectModel={handleSelectModel}
                    onSelectProduct={handleSelectProduct}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Primary nav */}
          <nav className="py-2">
            <p className="px-4 pt-2 pb-1 text-[10px] uppercase font-black tracking-widest text-gray-400">
              Shop
            </p>
            <Link
              to="/brand-selection"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-4 py-3 text-sm font-bold text-secondary hover:bg-gray-50 transition-colors border-b border-gray-50">
              <span className="flex items-center gap-3">
                <Tag size={16} className="text-primary" /> Brands
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>

            <p className="px-4 pt-4 pb-1 text-[10px] uppercase font-black tracking-widest text-gray-400">
              Categories
            </p>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-4 py-3 text-sm font-bold text-secondary hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <span className="flex items-center gap-3 min-w-0">
                    <Package size={16} className="text-primary shrink-0" />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </Link>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-gray-400 italic">
                Loading categories…
              </p>
            )}

            <p className="px-4 pt-4 pb-1 text-[10px] uppercase font-black tracking-widest text-gray-400">
              My account
            </p>
            <Link
              to="/profile"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-4 py-3 text-sm font-bold text-secondary hover:bg-gray-50 transition-colors border-b border-gray-50">
              <span className="flex items-center gap-3">
                <Package size={16} className="text-primary" /> Orders
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              to="/replacement-requests"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-4 py-3 text-sm font-bold text-secondary hover:bg-gray-50 transition-colors border-b border-gray-50">
              <span className="flex items-center gap-3">
                <RefreshCw size={16} className="text-primary" /> Replacement Requests
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              to="/support"
              onClick={closeMobileMenu}
              className="flex items-center justify-between px-4 py-3 text-sm font-bold text-secondary hover:bg-gray-50 transition-colors border-b border-gray-50">
              <span className="flex items-center gap-3">
                <HelpCircle size={16} className="text-primary" /> Plusway Support
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </nav>

          {/* Language */}
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">
              Language
            </p>
            <LanguageSelector variant="compact" showFlag={true} showNative={true} />
          </div>

          {/* Contact */}
          <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-2">
              Support
            </p>
            <a
              href="tel:+919599197756"
              className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary transition-colors">
              <Phone size={14} className="text-primary" /> +91 9599197756
            </a>
          </div>
        </div>

        {/* Drawer footer — logout pinned at the bottom when signed in */}
        {userInfo && (
          <div className="border-t border-gray-100 p-3 bg-white">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-black py-2.5 rounded text-[11px] uppercase tracking-widest hover:bg-red-600 transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Navigation Drawer Trigger Style */}
      <div className="bg-secondary text-white hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 flex items-center h-10">
          {/* "All Categories" dropdown trigger */}
          <div ref={categoriesMenuRef} className="relative h-full">
            <button
              type="button"
              onClick={() => setIsCategoriesMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={isCategoriesMenuOpen}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 h-full px-6 font-black text-xs uppercase tracking-widest transition-colors">
              <Menu size={16} /> All Categories
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isCategoriesMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoriesMenuOpen && (
              <div
                role="menu"
                className="absolute z-50 left-0 top-full w-72 max-h-[70vh] overflow-y-auto bg-white text-secondary rounded-b-xl shadow-2xl border border-gray-100">
                <ul className="py-2">
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category) => (
                      <li key={category._id}>
                        <Link
                          to={`/products?category=${category._id}`}
                          onClick={() => setIsCategoriesMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold normal-case tracking-normal hover:bg-orange-50 hover:text-primary transition-colors">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-8 h-8 object-contain rounded-md bg-gray-50 p-1 shrink-0"
                            />
                          ) : (
                            <Tag
                              size={16}
                              className="text-primary shrink-0"
                            />
                          )}
                          <span className="truncate">{category.name}</span>
                          <ChevronRight
                            size={14}
                            className="ml-auto text-gray-300 shrink-0"
                          />
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-xs text-gray-400 italic text-center">
                      No categories yet
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-8 px-8 items-center h-full text-[11px] font-black uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link
              to="/brand-selection"
              className="hover:text-primary transition-colors">
              Brands
            </Link>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="hover:text-primary transition-colors">
                  {category.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
