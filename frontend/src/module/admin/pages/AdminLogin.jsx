import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        "http://localhost:5001/api/admin/login",
        {
          email,
          password,
        },
      );

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminInfo", JSON.stringify(data));
      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-2xl shadow-blue-500/20">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            PlusWay<span className="text-blue-500">Admin</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest font-bold">
            Management Portal
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-[32px] shadow-2xl border border-gray-800 overflow-hidden">
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">
                Login to your account
              </h2>
              <p className="text-gray-400 text-sm">
                Enter your administrative credentials
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@plusway.com"
                    className="w-full pl-12 pr-4 py-4 bg-[#0F172A] border border-gray-800 rounded-2xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-[#0F172A] border border-gray-800 rounded-2xl focus:outline-none focus:border-blue-500 text-white transition-all placeholder:text-gray-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-gray-800 flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-gray-500 tracking-widest">
              <ShieldCheck size={14} className="text-blue-500" />
              Secure Admin Access
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-gray-600 uppercase tracking-[0.2em]">
          &copy; 2026 PLUSWAY SPARE PARTS • ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
