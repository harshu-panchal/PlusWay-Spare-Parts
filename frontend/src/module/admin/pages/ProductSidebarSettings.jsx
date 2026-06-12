import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { Save } from "lucide-react";

const ProductSidebarSettings = () => {
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

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-8 space-y-8">
          <div className="space-y-8">
            {['needHelp', 'freeShipping', 'guarantee', 'paymentProtection'].map((key) => {
              const item = settings.productSidebar?.[key];
              const label = key === 'needHelp' ? 'Need Help' :
                            key === 'freeShipping' ? 'Free Shipping' :
                            key === 'guarantee' ? 'Plusway Guarantee' : 'Payment Protection';
              return (
                <div key={key} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-bold text-secondary mb-4">{label} Section</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Title</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item?.title || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          productSidebar: {
                            ...settings.productSidebar,
                            [key]: { ...item, title: e.target.value }
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Description</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                        value={item?.description || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          productSidebar: {
                            ...settings.productSidebar,
                            [key]: { ...item, description: e.target.value }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

export default ProductSidebarSettings;
