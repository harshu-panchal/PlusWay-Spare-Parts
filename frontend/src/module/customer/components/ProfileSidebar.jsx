import React from "react";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Overview",
      icon: <User size={18} />,
      path: "/profile",
      active: location.pathname === "/profile",
    },
    {
      name: "My Orders",
      icon: <Package size={18} />,
      path: "/profile/orders",
      active: location.pathname === "/profile/orders",
    },
    {
      name: "My Addresses",
      icon: <MapPin size={18} />,
      path: "/profile/addresses",
      active: location.pathname === "/profile/addresses",
    },
    {
      name: "My Wishlist",
      icon: <Heart size={18} />,
      path: "/profile/wishlist",
      active: location.pathname === "/profile/wishlist",
    },
    {
      name: "Account Settings",
      icon: <Settings size={18} />,
      path: "/profile/settings",
      active: location.pathname === "/profile/settings",
    },
    {
      name: "Logout",
      icon: <LogOut size={18} />,
      action: handleLogout,
      color: "text-red-500",
    },
  ];

  return (
    <aside className="lg:col-span-4 space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-primary border border-orange-100">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
              {userInfo?.name.split(" ")[0]}{" "}
              <span className="text-primary italic">
                {userInfo?.name.split(" ").slice(1).join(" ")}
              </span>
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              +91 {userInfo?.mobile}
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() =>
                item.action ? item.action() : navigate(item.path)
              }
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold text-sm uppercase tracking-wider ${item.active
                  ? "bg-secondary text-white"
                  : "hover:bg-gray-50 text-gray-400 hover:text-secondary"
                }`}>
              <div className={`flex items-center gap-3 ${item.color || ""}`}>
                {item.icon}
                {item.name}
              </div>
              <ChevronRight
                size={16}
                className={item.active ? "text-primary" : "text-gray-200"}
              />
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
