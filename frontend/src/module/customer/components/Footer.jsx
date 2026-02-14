import React from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 hidden md:block">
      {/* Stay Connected Banner */}
      <div className="bg-secondary py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <h3 className="text-xl font-black uppercase tracking-tight">
            Stay Connected
          </h3>
          <div className="flex w-full md:w-96 relative group">
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full bg-white/10 border border-white/20 rounded py-3px-4 px-4 text-sm focus:outline-none focus:bg-white focus:text-secondary transition-all"
            />
            <button className="absolute right-0 top-0 h-full px-5 bg-primary text-white rounded-r hover:bg-orange-600 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* My Account */}
          <div>
            <h4 className="font-black text-secondary uppercase tracking-widest text-xs pb-2 border-b-2 border-primary w-fit mb-6">
              My Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-primary transition-colors text-[13px] font-bold">
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-primary transition-colors text-[13px] font-bold">
                  Create account
                </Link>
              </li>
            </ul>
          </div>

          {/* Plusway.com */}
          <div>
            <h4 className="font-black text-secondary uppercase tracking-widest text-xs pb-2 border-b-2 border-primary w-fit mb-6">
              Plusway.com
            </h4>
            <ul className="space-y-3 text-[13px] font-bold text-gray-500">
              <li>
                <Link to="/about" className={"hover:text-primary transition-colors cursor-pointer"}>
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/career" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Career with us
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Sitemap
                </Link>
              </li>
              <li>
                <Link to="/mobile-directory" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Mobile Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-black text-secondary uppercase tracking-widest text-xs pb-2 border-b-2 border-primary w-fit mb-6">
              Customer Service
            </h4>
            <ul className="space-y-3 text-[13px] font-bold text-gray-500">
              <li>
                <Link to="/support" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Contact Customer Support
                </Link>
              </li>
              <li>
                <Link to="/track-order" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/warranty" className={"hover:text-primary transition-colors cursor-pointer"}>
                  Warranty T&C
                </Link>
              </li>
            </ul>
          </div>

          {/* How to Plusway */}
          <div>
            <h4 className="font-black text-secondary uppercase tracking-widest text-xs pb-2 border-b-2 border-primary w-fit mb-6">
              How to Plusway
            </h4>
            <ul className="space-y-3 text-[13px] font-bold text-gray-500">
              <li>
                <Link to="/how-to-manuals" className={"hover:text-primary transition-colors cursor-pointer"}>
                  How to Manual's
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] text-center">
            © 2004 - 2026 Plusway.com. By Elcotek
          </p>
          <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 text-[10px] font-bold text-gray-400">
            VISA | MASTERCARD | UPI | NET BANKING
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
