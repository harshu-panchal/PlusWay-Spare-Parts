import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, XCircle, FileText, Mail } from "lucide-react";

const Warranty = () => {
  const coverageItems = [
    "Manufacturing defects",
    "Material failures",
    "Functional issues under normal use",
    "Premature wear under normal conditions",
  ];

  const exclusions = [
    "Normal wear and tear",
    "Damage from misuse or abuse",
    "Unauthorized modifications",
    "Damage from accidents or improper installation",
    "Cosmetic damage that doesn't affect functionality",
    "Products with removed or altered serial numbers",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Warranty Policy
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Quality assurance and warranty coverage for your spare parts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-black text-secondary uppercase mb-4">
            Warranty Overview
          </h2>
          <p className="text-gray-600 font-medium mb-4">
            At PlusWay, we stand behind the quality of our products. All spare
            parts sold on our platform come with manufacturer warranties that
            protect you against defects in materials and workmanship.
          </p>
          <p className="text-gray-600 font-medium">
            Warranty periods vary by product and manufacturer, typically ranging
            from 6 months to 2 years. Specific warranty terms are listed on each
            product page.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* What's Covered */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-black text-secondary uppercase">
                  What's Covered
                </h2>
              </div>

              <div className="space-y-3">
                {coverageItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-800 font-medium">
                  <strong>Note:</strong> All warranty claims are subject to
                  verification and must be submitted with proof of purchase and
                  product serial number.
                </p>
              </div>
            </div>

            {/* What's Not Covered */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
                <h2 className="text-2xl font-black text-secondary uppercase">
                  What's Not Covered
                </h2>
              </div>

              <div className="space-y-3">
                {exclusions.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warranty Claim Process */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-black text-secondary uppercase">
                  How to File a Warranty Claim
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-black flex items-center justify-center">
                      1
                    </div>
                    <h3 className="text-lg font-black text-secondary uppercase">
                      Contact Support
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium ml-11">
                    Reach out to our customer support team via email or phone
                    with your order details and issue description.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-black flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-lg font-black text-secondary uppercase">
                      Provide Documentation
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium ml-11">
                    Submit proof of purchase, product photos showing the defect,
                    and product serial number if applicable.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-black flex items-center justify-center">
                      3
                    </div>
                    <h3 className="text-lg font-black text-secondary uppercase">
                      Evaluation
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium ml-11">
                    Our team will review your claim within 24-48 hours and
                    determine if it falls under warranty coverage.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-black flex items-center justify-center">
                      4
                    </div>
                    <h3 className="text-lg font-black text-secondary uppercase">
                      Resolution
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-medium ml-11">
                    If approved, we'll either replace the product, repair it, or
                    issue a refund based on the warranty terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
              <h2 className="text-2xl font-black text-secondary uppercase mb-6">
                Important Information
              </h2>

              <div className="space-y-4 text-gray-600 font-medium text-sm">
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Proof of Purchase Required
                  </h3>
                  <p>
                    All warranty claims must be accompanied by a valid proof of
                    purchase (invoice or order confirmation). Please keep your
                    receipts safe.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Warranty Transfer
                  </h3>
                  <p>
                    Manufacturer warranties are generally non-transferable. If
                    you sell or gift a product, the warranty may not transfer to
                    the new owner.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Extended Warranty
                  </h3>
                  <p>
                    Some products may offer extended warranty options for
                    purchase. These will be clearly indicated on the product
                    page.
                  </p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-2">
                    Warranty Period Start Date
                  </h3>
                  <p>
                    The warranty period begins from the date of delivery, not
                    the date of purchase or order placement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact for Warranty Claims */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-black text-secondary uppercase">
                  Warranty Support
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 font-bold mb-1">Email</p>
                  <p className="text-gray-800 font-medium">
                    warranty@plusway.in
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold mb-1">Phone</p>
                  <p className="text-gray-800 font-medium">+91 9599197756</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold mb-1">Hours</p>
                  <p className="text-gray-800 font-medium">
                    Mon-Sat: 9 AM - 7 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-black text-secondary uppercase mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/contact"
                  className="block w-full bg-primary text-white text-center font-black py-3 rounded uppercase text-sm tracking-wider hover:bg-orange-600 transition-colors">
                  File a Claim
                </Link>
                <Link
                  to="/profile/orders"
                  className="block w-full bg-white border-2 border-secondary text-secondary text-center font-black py-3 rounded uppercase text-sm tracking-wider hover:bg-gray-50 transition-colors">
                  View Orders
                </Link>
              </div>
            </div>

            {/* Related Links */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6">
              <h3 className="text-lg font-black text-secondary uppercase mb-4">
                Related Pages
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="/refund-policy"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Refund Policy
                </a>
                <a
                  href="/terms-conditions"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Terms & Conditions
                </a>
                <a
                  href="/support"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Support Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warranty;
