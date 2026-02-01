import React, { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Check } from "lucide-react";
import ProfileSidebar from "../components/ProfileSidebar";

const Addresses = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "Harshvardhan Panchal",
      mobile: "6268423924",
      street: "123 Main St, Near City Center",
      city: "Indore",
      state: "Madhya Pradesh",
      pincode: "452001",
      isDefault: true,
    },
  ]);

  return (
    <div className="bg-[#f4f4f4] min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-secondary mb-8 uppercase italic tracking-tighter">
          MY <span className="text-primary italic">ADDRESSES</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <ProfileSidebar />

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-secondary uppercase italic tracking-tighter">
                  Saved <span className="text-primary italic">Addresses</span>
                </h2>
                <button className="flex items-center gap-2 bg-primary text-white text-[10px] font-black py-3 px-6 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-secondary transition-all">
                  <Plus size={16} />
                  Add New
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`relative p-6 rounded-2xl border transition-all ${
                      address.isDefault
                        ? "border-primary bg-orange-50/30"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {address.isDefault && (
                      <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full shadow-sm">
                        <Check size={12} />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                          {address.type}
                        </span>
                        <p className="text-sm font-black text-secondary uppercase tracking-wider">
                          {address.name}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 mb-6">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {address.street}
                      </p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-xs font-black text-secondary uppercase tracking-widest pt-2">
                        +91 {address.mobile}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100/50">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary hover:border-primary transition-all">
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addresses;
