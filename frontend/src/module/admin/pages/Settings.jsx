import React, { useState, useEffect, useContext, createContext } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube,
  Save, Globe, Shield, Truck, MessageCircle, Search,
  CheckCircle, AlertCircle,
} from "lucide-react";

const DEFAULTS = {
  general: {
    siteName: "Plusway Spare Parts",
    siteTagline: "Your trusted mobile spare parts partner",
    siteLogoUrl: "",
  },
  contact: {
    supportPhone: "+91 9870162128",
    whatsappNumber: "919870162128",
    supportEmail: "plusway9@gmail.com",
    officeAddress: "New Delhi, India",
  },
  social: { facebookUrl: "", twitterUrl: "", instagramUrl: "", youtubeUrl: "" },
  shipping: {
    standardShippingFee: 0,
    freeShippingThreshold: 0,
    estimatedDelivery: "3-5 Business Days",
    taxPercentage: 0,
  },
  seo: {
    metaTitle: "Plusway Spare Parts | Genuine Mobile Spare Parts Online",
    metaDescription: "",
    keywords: "",
    searchIndexing: true,
  },
};

// Form field helpers live outside Settings: defined inside it they'd be new
// component types on every render, so React would remount the inputs and
// they'd lose focus after each keystroke. form/set come from context.
const SettingsFormContext = createContext(null);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-700">{label}</label>
    {children}
  </div>
);

const Input = ({ section, field, type = "text", icon: Icon, ...rest }) => {
  const { form, set } = useContext(SettingsFormContext);
  return (
    <div className={Icon ? "relative" : undefined}>
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />}
      <input
        type={type}
        value={form[section][field] ?? ""}
        onChange={(e) => set(section, field, type === "number" ? Number(e.target.value) : e.target.value)}
        className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none`}
        {...rest}
      />
    </div>
  );
};

const Textarea = ({ section, field, icon: Icon, ...rest }) => {
  const { form, set } = useContext(SettingsFormContext);
  return (
    <div className={Icon ? "relative" : undefined}>
      {Icon && <Icon className="absolute left-3 top-3 text-gray-400" size={16} />}
      <textarea
        value={form[section][field] ?? ""}
        onChange={(e) => set(section, field, e.target.value)}
        className={`w-full ${Icon ? "pl-10" : "px-4"} pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none`}
        {...rest}
      />
    </div>
  );
};

const Toggle = ({ section, field, label, description }) => {
  const { form, set } = useContext(SettingsFormContext);
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
      <div>
        <h4 className="font-bold text-gray-800">{label}</h4>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!!form[section][field]}
          onChange={(e) => set(section, field, e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  useEffect(() => {
    axios.get(API_ENDPOINTS.GET_SETTINGS)
      .then(({ data }) => {
        setForm((prev) => ({
          ...prev,
          general:  { ...prev.general,  ...data.general },
          contact:  { ...prev.contact,  ...data.contact },
          social:   { ...prev.social,   ...data.social },
          shipping: { ...prev.shipping, ...data.shipping },
          seo:      { ...prev.seo,      ...data.seo },
        }));
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, []);

  const set = (section, field, value) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.put(API_ENDPOINTS.UPDATE_SETTINGS, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("success", "Settings saved successfully!");
    } catch {
      showToast("error", "Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general",  name: "General",          icon: Globe },
    { id: "contact",  name: "Contact & Support", icon: Phone },
    { id: "social",   name: "Social Media",      icon: Facebook },
    { id: "shipping", name: "Shipping & Tax",    icon: Truck },
    { id: "seo",      name: "SEO Settings",      icon: Search },
  ];

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SettingsFormContext.Provider value={{ form, set }}>
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === "success" ? "bg-green-600" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
            <tab.icon size={18} />
            {tab.name}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <div className="p-8 space-y-8">

          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Site Name">
                  <Input section="general" field="siteName" placeholder="Plusway Spare Parts" />
                </Field>
                <Field label="Site Tagline">
                  <Input section="general" field="siteTagline" placeholder="Your trusted mobile spare parts partner" />
                </Field>
              </div>
              <Field label="Site Logo URL">
                <Input section="general" field="siteLogoUrl" placeholder="https://example.com/logo.png" />
              </Field>
            </div>
          )}

          {/* ── CONTACT ── */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Support Phone">
                  <Input section="contact" field="supportPhone" icon={Phone} placeholder="+91 9870162128" />
                </Field>
                <Field label="WhatsApp Number (digits only, with country code)">
                  <Input section="contact" field="whatsappNumber" icon={MessageCircle} placeholder="919870162128" />
                </Field>
                <Field label="Support Email">
                  <Input section="contact" field="supportEmail" type="email" icon={Mail} placeholder="support@example.com" />
                </Field>
              </div>
              <Field label="Office Address">
                <Textarea section="contact" field="officeAddress" icon={MapPin} placeholder="123 Market Street, New Delhi, India" />
              </Field>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Facebook", field: "facebookUrl", icon: Facebook, color: "text-blue-600" },
                  { label: "Twitter",  field: "twitterUrl",  icon: Twitter,  color: "text-blue-400" },
                  { label: "Instagram",field: "instagramUrl",icon: Instagram, color: "text-pink-600" },
                  { label: "YouTube",  field: "youtubeUrl",  icon: Youtube,  color: "text-red-600" },
                ].map((network) => {
                  const SocialIcon = network.icon;
                  return (
                    <Field key={network.field} label={`${network.label} URL`}>
                      <div className="relative">
                        <SocialIcon className={`absolute left-3 top-1/2 -translate-y-1/2 ${network.color}`} size={16} />
                        <input
                          type="text"
                          value={form.social[network.field] ?? ""}
                          onChange={(e) => set("social", network.field, e.target.value)}
                          placeholder={`https://${network.label.toLowerCase()}.com/yourpage`}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </Field>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SHIPPING ── */}
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Standard Shipping Fee (₹)">
                  <Input section="shipping" field="standardShippingFee" type="number" placeholder="99" />
                </Field>
                <Field label="Free Shipping Threshold (₹) — 0 = always free">
                  <Input section="shipping" field="freeShippingThreshold" type="number" placeholder="0" />
                </Field>
                <Field label="Estimated Delivery">
                  <Input section="shipping" field="estimatedDelivery" placeholder="3-5 Business Days" />
                </Field>
                <Field label="Tax Percentage (%)">
                  <Input section="shipping" field="taxPercentage" type="number" placeholder="0" />
                </Field>
              </div>
              <p className="text-xs text-gray-500">
                If the cart total is ≥ Free Shipping Threshold, shipping is free. Set threshold to 0 to always charge standard shipping fee. Shipping fee and tax are applied at checkout.
              </p>
            </div>
          )}

          {/* ── SEO ── */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <Field label="Meta Title">
                <Input section="seo" field="metaTitle" placeholder="Plusway Spare Parts | Genuine Mobile Spare Parts Online" />
              </Field>
              <Field label="Meta Description">
                <Textarea section="seo" field="metaDescription" placeholder="Buy genuine mobile spare parts at best prices." />
              </Field>
              <Field label="Keywords (comma separated)">
                <Input section="seo" field="keywords" placeholder="mobile spare parts, lcd screen, battery" />
              </Field>
              <Toggle section="seo" field="searchIndexing" label="Search Engine Indexing" description="Allow search engines to crawl and index your site" />
            </div>
          )}

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors shadow-sm font-bold ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              <Save size={18} />
              {loading ? "SAVING..." : "SAVE SETTINGS"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </SettingsFormContext.Provider>
  );
};

export default Settings;
