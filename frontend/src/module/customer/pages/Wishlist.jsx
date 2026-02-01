import React, { useState } from "react";
import { Heart, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileSidebar from "../components/ProfileSidebar";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([
    // Placeholder data
    {
      id: 1,
      name: "iPhone 13 Pro Max LCD with Touch Screen",
      price: 12500,
      image: "https://via.placeholder.com/150",
      inStock: true,
    },
  ]);

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          MY <span className="text-primary italic">WISHLIST</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Favorite <span className="text-primary italic">Items</span>
                </h2>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={40} className="text-gray-200" />
                  </div>
                  <h3 className="text-lg font-black text-secondary uppercase tracking-tighter mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
                    Start adding items you love to your wishlist!
                  </p>
                  <Link
                    to="/"
                    className="bg-primary text-white text-[10px] font-black py-4 px-8 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:bg-secondary transition-all"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-gray-50/30 border border-gray-100 rounded-3xl p-4 hover:border-primary transition-all"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-white border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                        <button className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Spare Parts
                        </p>
                        <h3 className="text-xs font-black text-secondary uppercase tracking-wider line-clamp-2 min-h-[32px]">
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-lg font-black text-primary tracking-tighter">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <span className="text-[8px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">
                            In Stock
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white text-[10px] font-black py-3 rounded-xl uppercase tracking-widest hover:bg-black transition-all shadow-md">
                          <ShoppingCart size={14} />
                          Add to Cart
                        </button>
                        <Link
                          to={`/product/${item.id}`}
                          className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary hover:border-primary transition-all"
                        >
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
