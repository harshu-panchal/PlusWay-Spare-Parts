import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";
import { CartContext } from "../context/CartContext";

const BottomNav = () => {
    const location = useLocation();
    const { cartItems } = useContext(CartContext);

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const navItems = [
        {
            name: "Home",
            icon: Home,
            path: "/",
            active: location.pathname === "/",
        },
        {
            name: "Categories",
            icon: Grid3x3,
            path: "/brand-selection",
            active: location.pathname.includes("/brand-selection") || location.pathname.includes("/category/"),
        },
        {
            name: "Cart",
            icon: ShoppingCart,
            path: "/cart",
            active: location.pathname === "/cart",
            badge: cartCount,
        },
        {
            name: "Profile",
            icon: User,
            path: "/profile",
            active: location.pathname.includes("/profile") || location.pathname === "/login",
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${item.active
                                    ? "text-primary"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <div className="relative">
                                <Icon
                                    size={24}
                                    className={`transition-all duration-200 ${item.active ? "scale-110" : ""
                                        }`}
                                    strokeWidth={item.active ? 2.5 : 2}
                                />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`text-[10px] font-bold mt-1 transition-all duration-200 ${item.active ? "text-primary" : "text-gray-500"
                                    }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
