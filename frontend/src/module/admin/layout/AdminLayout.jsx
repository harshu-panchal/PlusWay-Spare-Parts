import React, { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  Layers,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  PlusSquare,
  BarChart3,
  Smartphone,
  MessageSquare,
  LifeBuoy,
  History,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Image,
  Wallet,
  Sidebar,
} from "lucide-react";
import { removeFCMToken } from "../../../services/pushNotificationService";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuSections = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { name: "Wallet", path: "/admin/wallet", icon: Wallet },
        { name: "Reports", path: "/admin/reports", icon: BarChart3 },
      ],
    },
    {
      title: "Catalog",
      items: [
        { name: "Products", path: "/admin/products", icon: Package },
        { name: "Categories", path: "/admin/categories", icon: Layers },
        { name: "Brands", path: "/admin/brands", icon: Tags },
        { name: "Models", path: "/admin/models", icon: Smartphone },
        { name: "Stock", path: "/admin/stock", icon: PlusSquare },
        { name: "Upload History", path: "/admin/bulk-upload-history", icon: History },
      ],
    },
    {
      title: "Sales & Customers",
      items: [
        { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
        { name: "Customers", path: "/admin/customers", icon: Users },
      ],
    },
    {
      title: "Support",
      items: [
        { name: "Reviews", path: "/admin/reviews", icon: MessageSquare },
        { name: "Support Tickets", path: "/admin/support", icon: LifeBuoy },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Home Sections", path: "/admin/home-sections", icon: Layers }, // Using Layers icon or similar
        { name: "Banners", path: "/admin/banners", icon: Image },
        { name: "Product Sidebar", path: "/admin/product-sidebar", icon: Sidebar },
        { name: "Settings", path: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const allItems = menuSections.flatMap((section) => section.items);
  const currentItem = allItems.find((item) => item.path === location.pathname);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeFCMToken();
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"
          } transition-all duration-300 bg-[#0F172A] text-gray-400 flex flex-col relative z-20 shadow-2xl`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
              <Package size={18} />
            </div>
            {isSidebarOpen && (
              <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                PlusWay<span className="text-blue-500">Admin</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 sidebar-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-6 px-4">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center p-3 rounded-xl transition-all group relative ${isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "hover:bg-gray-800/50 hover:text-gray-200"
                          }`}>
                        <item.icon
                          size={20}
                          className={
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-300"
                          }
                        />
                        {isSidebarOpen && (
                          <span className="ml-3 font-medium text-sm">
                            {item.name}
                          </span>
                        )}
                        {isActive && !isSidebarOpen && (
                          <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800/50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-400 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all group">
            <LogOut size={20} />
            {isSidebarOpen && (
              <span className="ml-3 font-medium text-sm">Logout</span>
            )}
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 shadow-sm transition-all z-30">
            {isSidebarOpen ? (
              <ChevronLeft size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {currentItem?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search anything..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
              />
            </div>

            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 pr-3 rounded-xl transition-all group">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <User size={18} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-gray-800 leading-none">
                    Admin User
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8" data-scroll-container>
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
