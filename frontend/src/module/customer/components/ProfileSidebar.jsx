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
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all font-bold text-sm uppercase tracking-wider ${
                item.active
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

      <div className="bg-primary p-8 rounded-[32px] shadow-lg shadow-orange-500/20 text-white relative overflow-hidden group">
        <div className="relative z-10">
          <ShieldCheck size={32} className="mb-4" />
          <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">
            Plusway <span className="text-secondary italic">Premium</span>
          </h3>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6 underline">
            Join Member's Club
          </p>
          <button className="bg-secondary text-white text-[10px] font-black py-2 px-4 rounded-lg uppercase tracking-[0.2em] shadow-lg">
            Upgrade Now
          </button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
