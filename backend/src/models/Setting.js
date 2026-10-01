import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    general: {
      siteName:    { type: String, default: "Plusway Spare Parts" },
      siteTagline: { type: String, default: "Your trusted mobile spare parts partner" },
      siteLogoUrl: { type: String, default: "" },
    },
    header: {
      showOffersLink: { type: Boolean, default: true },
    },
    contact: {
      supportPhone:   { type: String, default: "+91 9870162128" },
      whatsappNumber: { type: String, default: "919870162128" },
      supportEmail:   { type: String, default: "plusway9@gmail.com" },
      officeAddress:  { type: String, default: "New Delhi, India" },
    },
    social: {
      facebookUrl:  { type: String, default: "" },
      twitterUrl:   { type: String, default: "" },
      instagramUrl: { type: String, default: "" },
      youtubeUrl:   { type: String, default: "" },
    },
    shipping: {
      standardShippingFee:    { type: Number, default: 0 },
      freeShippingThreshold:  { type: Number, default: 0 },
      estimatedDelivery:      { type: String, default: "3-5 Business Days" },
      taxPercentage:          { type: Number, default: 0 },
    },
    seo: {
      metaTitle:       { type: String, default: "Plusway Spare Parts | Genuine Mobile Spare Parts Online" },
      metaDescription: { type: String, default: "Buy genuine mobile spare parts, LCD screens, batteries, and accessories for all major brands at best prices." },
      keywords:        { type: String, default: "mobile spare parts, lcd screen, battery, iphone parts, samsung parts" },
      searchIndexing:  { type: Boolean, default: true },
    },
    productSidebar: {
      needHelp: {
        title:       { type: String, default: "Need help?" },
        description: { type: String, default: "Call us on 9870162128 & select ext. 2 to speak to our sales team specialist." },
      },
      freeShipping: {
        title:       { type: String, default: "Free Shipping" },
        description: { type: String, default: "All India Free Shipping with Express Delivery" },
      },
      guarantee: {
        title:       { type: String, default: "Plusway Guarantee" },
        description: { type: String, default: "100% Refund if you do not get your shipment within time" },
      },
      paymentProtection: {
        title:       { type: String, default: "Payment Protection" },
        description: { type: String, default: "Secure Payments & Easy Returns" },
      },
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
