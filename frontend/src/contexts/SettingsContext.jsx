import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

const SettingsContext = createContext(null);

// Sensible defaults so every consumer works before the first fetch completes.
const DEFAULT_SETTINGS = {
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
  social: {
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
  },
  shipping: {
    standardShippingFee: 0,
    freeShippingThreshold: 0,
    estimatedDelivery: "3-5 Business Days",
    taxPercentage: 0,
  },
  payments: {
    razorpayEnabled: true,
    codEnabled: true,
    bankTransferEnabled: false,
  },
  seo: {
    metaTitle: "Plusway Spare Parts | Genuine Mobile Spare Parts Online",
    metaDescription: "Buy genuine mobile spare parts at best prices.",
    keywords: "mobile spare parts, lcd screen, battery",
    searchIndexing: true,
  },
  productSidebar: {
    needHelp:          { title: "Need help?",          description: "Call us on 9870162128" },
    freeShipping:      { title: "Free Shipping",        description: "All India Free Shipping with Express Delivery" },
    guarantee:         { title: "Plusway Guarantee",    description: "100% Refund if you do not get your shipment within time" },
    paymentProtection: { title: "Payment Protection",   description: "Secure Payments & Easy Returns" },
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API_ENDPOINTS.GET_SETTINGS)
      .then(({ data }) => {
        // Deep-merge fetched data over defaults so any missing DB fields still
        // return a usable value from the defaults above.
        setSettings((prev) => ({
          ...prev,
          ...data,
          general:         { ...prev.general,         ...data.general },
          contact:         { ...prev.contact,         ...data.contact },
          social:          { ...prev.social,          ...data.social },
          shipping:        { ...prev.shipping,        ...data.shipping },
          payments:        { ...prev.payments,        ...data.payments },
          seo:             { ...prev.seo,             ...data.seo },
          productSidebar:  { ...prev.productSidebar,  ...data.productSidebar },
        }));
      })
      .catch(() => {
        // On error keep DEFAULT_SETTINGS — the app remains functional.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
