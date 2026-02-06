import React, { useState, useContext, useEffect } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  Phone,
  ChevronDown,
  Send,
} from "lucide-react";
import LanguageSelector from "../../../components/LanguageSelector";
import { Link, useNavigate } from "react-router-dom";

import { CartContext } from "../context/CartContext";
import { API_ENDPOINTS } from "../../../config/api";

import axios from "axios";

const Header = () => {
  const { cartItems } = useContext(CartContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_ENDPOINTS.CUSTOMER_CATEGORIES}?all=true`);
        setCategories(data.categories || data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/products?keyword=${searchQuery}`);
    }
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce(
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
            <LanguageSelector variant="compact" showFlag={true} showNative={false} />
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
        <div className="flex-1 max-w-2xl relative hidden md:block group">
          <input
            type="text"
            placeholder="Search Plusway.com"
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary transition-all text-sm font-medium bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button onClick={handleSearch} className="absolute right-0 top-0 h-full px-4 bg-gray-50 border-l border-gray-300 rounded-r hover:bg-gray-100 transition-colors">
            <Search size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Account Dropdown */}
          <div className="relative group/account">
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
                    <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 cursor-pointer">
                      Replacement Requests{" "}
                      <ChevronDown
                        size={12}
                        className="-rotate-90 text-gray-300"
                      />
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between cursor-pointer">
                      Plusway Support{" "}
                      <ChevronDown
                        size={12}
                        className="-rotate-90 text-gray-300"
                      />
                    </div>
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
          <Link to="/cart" className="flex items-center gap-2 group">
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

          <button className="md:hidden text-secondary">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Navigation Drawer Trigger Style */}
      <div className="bg-secondary text-white hidden md:block border-b border-white/10">
        <div className="max-w-7xl mx-auto px-[2%] md:px-4 flex items-center h-10">
          <div className="flex items-center gap-2 bg-primary h-full px-6 cursor-pointer font-black text-xs uppercase tracking-widest">
            <Menu size={16} /> All Categories
          </div>
          <div className="flex gap-8 px-8 items-center h-full text-[11px] font-black uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap">
            <Link to="/brand-selection" className="hover:text-primary transition-colors">
              Brands
            </Link>
            {categories.map((category) => (
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
