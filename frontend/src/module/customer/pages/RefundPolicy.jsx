import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, CheckCircle, XCircle, Package, Clock } from "lucide-react";

const RefundPolicy = () => {
  const eligibleItems = [
    "Product received is defective or damaged",
    "Wrong item delivered",
    "Product not as described",
    "Missing parts or accessories",
  ];

  const nonEligibleItems = [
    "Change of mind after 30 days",
    "Product damaged due to misuse",
    "Missing original packaging",
    "Items marked as non-returnable",
  ];

  const returnSteps = [
    {
      step: 1,
      title: "Initiate Return",
      description:
        "Contact our support or use your order page to request a return",
    },
    {
      step: 2,
      title: "Approval",
      description: "We'll review your request and approve within 24 hours",
    },
    {
      step: 3,
      title: "Ship Back",
      description:
        "Pack the item securely and ship it back using our provided label",
    },
    {
      step: 4,
      title: "Receive Refund",
      description:
        "Get your refund within 5-7 business days after we receive the item",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <RotateCcw className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Refund Policy
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            We want you to be completely satisfied with your purchase
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-black text-secondary uppercase mb-2">
              30 Day Returns
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Return items within 30 days of delivery
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-black text-secondary uppercase mb-2">
              Original Condition
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Items must be unused with original packaging
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-black text-secondary uppercase mb-2">
              Quick Processing
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Refunds processed within 5-7 business days
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Eligibility Section */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-black text-secondary uppercase mb-6">
                Return Eligibility
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Eligible */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-black text-green-600 uppercase">
                      Eligible
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {eligibleItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm font-medium text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Non-Eligible */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-black text-red-600 uppercase">
                      Not Eligible
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {nonEligibleItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm font-medium text-gray-700">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Return Process */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-black text-secondary uppercase mb-6">
                Return Process
              </h2>

              <div className="space-y-6">
                {returnSteps.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-white font-black text-xl flex items-center justify-center">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-black text-secondary uppercase mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refund Information */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-black text-secondary uppercase mb-6">
                Refund Information
              </h2>

              <div className="space-y-4 text-gray-600 font-medium">
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Refund Timeline
                  </h3>
                  <p className="text-sm">
                    Once we receive your returned item, we'll inspect it and
                    process your refund within 5-7 business days. The refund
                    will be credited to your original payment method.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Shipping Costs
                  </h3>
                  <p className="text-sm">
                    If the return is due to our error (defective product, wrong
                    item, etc.), we'll cover the return shipping costs.
                    Otherwise, you'll be responsible for return shipping.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Exchange Policy
                  </h3>
                  <p className="text-sm">
                    We offer exchanges for defective or damaged items. Contact
                    our support team to arrange an exchange.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Late or Missing Refunds
                  </h3>
                  <p className="text-sm">
                    If you haven't received your refund after 7 business days,
                    please check your bank account and contact your credit card
                    company. If you still haven't received it, contact us at
                    plusway9@gmail.com.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-black text-secondary uppercase mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/profile/orders"
                  className="block w-full bg-primary text-white text-center font-black py-3 rounded uppercase text-sm tracking-wider hover:bg-orange-600 transition-colors">
                  View My Orders
                </Link>
                <Link
                  to="/contact"
                  className="block w-full bg-white border-2 border-secondary text-secondary text-center font-black py-3 rounded uppercase text-sm tracking-wider hover:bg-gray-50 transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-6">
              <h3 className="text-sm font-black text-yellow-800 uppercase mb-2">
                Important Note
              </h3>
              <p className="text-sm text-yellow-700 font-medium">
                Please ensure items are returned in their original condition
                with all accessories, manuals, and packaging. Items not meeting
                these criteria may not be eligible for a full refund.
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6">
              <h3 className="text-lg font-black text-secondary uppercase mb-4">
                Need Help?
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="/support"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Visit Help Center
                </a>
                <a
                  href="/track-order"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Track Your Order
                </a>
                <a
                  href="/warranty"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Warranty Information
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
