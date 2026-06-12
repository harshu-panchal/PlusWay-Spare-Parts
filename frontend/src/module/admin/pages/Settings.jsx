import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Save,
  Globe,
  Shield,
  Truck,
  CreditCard,
  MessageCircle,
  Search,
  Sidebar,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(API_ENDPOINTS.GET_SETTINGS);
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (settings) {
      try {
        setLoading(true);
        const token = JSON.parse(localStorage.getItem("adminInfo"))?.token;
        await axios.put(API_ENDPOINTS.UPDATE_SETTINGS, settings, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Settings saved successfully!");
      } catch (error) {
        console.error("Error saving settings:", error);
        alert("Failed to save settings");
      } finally {
        setLoading(false);
      }
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "contact", name: "Contact & Support", icon: Phone },
    { id: "social", name: "Social Media", icon: Facebook },
    { id: "shipping", name: "Shipping & Tax", icon: Truck },
    { id: "payments", name: "Payments", icon: CreditCard },
    { id: "seo", name: "SEO Settings", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            <tab.icon size={18} />
            {tab.name}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-8 space-y-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Site Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="Plusway Spare Parts"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Site Tagline
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="Your trusted mobile spare parts partner"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Site Logo URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue="https://placehold.co/150x50/2563eb/ffffff?text=PLUSWAY"
                />
              </div>
            </div>
          )}



          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Support Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      defaultValue="+91 9599197756"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    WhatsApp Support
                  </label>
                  <div className="relative">
                    <MessageCircle
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      defaultValue="+91 9310000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Support Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="email"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      defaultValue="support@plusway.com"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Office Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-3 text-gray-400"
                    size={16}
                  />
                  <textarea
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                    defaultValue="123 Mobile Market, New Delhi, India 110001"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Facebook", icon: Facebook, color: "text-blue-600" },
                  { label: "Twitter", icon: Twitter, color: "text-blue-400" },
                  {
                    label: "Instagram",
                    icon: Instagram,
                    color: "text-pink-600",
                  },
                  { label: "Youtube", icon: Youtube, color: "text-red-600" },
                ].map((social) => (
                  <div key={social.label} className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      {social.label} URL
                    </label>
                    <div className="relative">
                      <social.icon
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${social.color}`}
                        size={16}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder={`https://${social.label.toLowerCase()}.com/yourpage`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="99"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Estimated Delivery (Days)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="3-5 Business Days"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Tax Percentage (%)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="18"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    name: "Razorpay",
                    active: true,
                    desc: "Accept UPI, Cards, Netbanking",
                  },
                  {
                    name: "Cash on Delivery",
                    active: true,
                    desc: "Pay when you receive the order",
                  },
                  {
                    name: "Bank Transfer",
                    active: false,
                    desc: "Direct transfer to bank account",
                  },
                ].map((method) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-secondary">
                        {method.name}
                      </h4>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={method.active}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="Plusway Spare Parts | Genuine Mobile Spare Parts Online"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Meta Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                    defaultValue="Buy genuine mobile spare parts, LCD screens, batteries, and accessories for all major brands like Samsung, iPhone, Vivo, Xiaomi at best prices."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="mobile spare parts, lcd screen, battery, iphone parts, samsung parts"
                  />
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div>
                    <h4 className="font-bold text-secondary">
                      Search Engine Indexing
                    </h4>
                    <p className="text-xs text-gray-500">
                      Allow search engines to crawl and index your site
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={true}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave} 
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors shadow-sm font-bold ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Save size={18} />
              {loading ? "SAVING..." : "SAVE SETTINGS"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
