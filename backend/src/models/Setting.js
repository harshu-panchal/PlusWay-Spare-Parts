import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    productSidebar: {
      needHelp: {
        title: { type: String, default: "Need help?" },
        description: { type: String, default: "Call us on 9599197756 & select ext. 2 to speak to our sales team specialist." }
      },
      freeShipping: {
        title: { type: String, default: "Free Shipping" },
        description: { type: String, default: "All India Free Shipping with Express Delivery" }
      },
      guarantee: {
        title: { type: String, default: "Plusway Guarantee" },
        description: { type: String, default: "100% Refund if you do not get your shipment within time" }
      },
      paymentProtection: {
        title: { type: String, default: "Payment Protection" },
        description: { type: String, default: "Secure Payments & Easy Returns" }
      }
    }
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model("Setting", settingSchema);

export default Setting;
