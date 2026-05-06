import React, { useState } from "react";
import {
  Smartphone,
  User,
  Mail,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (formData.mobile.length === 10 && formData.name.length > 2) {
      setLoading(true);
      setError("");
      try {
        await axios.post(API_ENDPOINTS.CUSTOMER_SEND_OTP, {
          mobile: formData.mobile,
          type: "register",
        });
        setStep(2);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to send OTP. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      try {
        setLoading(true);
        setError("");
        // First verify OTP using the separate route
        await axios.post(API_ENDPOINTS.CUSTOMER_VERIFY_OTP, {
          mobile: formData.mobile,
          otp,
        });

        // If verification is successful, proceed to registration
        const { data } = await axios.post(
          API_ENDPOINTS.CUSTOMER_REGISTER,
          { ...formData, otp },
        );

        // Store customer info and token
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        setLoading(false);
        navigate("/");
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Registration failed. Please try again.",
        );
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      setFormData({
        ...formData,
        [name]: value.replace(/\D/g, "").slice(0, 10),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="bg-[#f4f4f4] min-h-[calc(100vh-160px)] flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 lg:p-14">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-primary mb-8 mx-auto shadow-sm">
              {step === 1 ? <User size={32} /> : <Smartphone size={32} />}
            </div>

            <h1 className="text-3xl font-black text-secondary mb-2 uppercase italic tracking-tighter text-center">
              CREATE <span className="text-primary italic">ACCOUNT</span>
            </h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] text-center mb-6">
              {step === 1
                ? "Join our community"
                : `Verify mobile +91 ${formData.mobile}`}
            </p>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6 border border-red-100">
                {error}
              </div>
            )}

            <form
              onSubmit={step === 1 ? handleNextStep : handleVerifyOTP}
              className="space-y-5">
              {step === 1 ? (
                <>
                  {/* Full Name */}
                  <div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3 h-6">
                        <span className="text-xs font-black text-secondary">
                          +91
                        </span>
                      </div>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        placeholder="Mobile Number"
                        className="w-full pl-20 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-black tracking-widest text-secondary transition-all"
                        value={formData.mobile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address (Optional)"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-bold text-secondary transition-all"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex gap-3 justify-between">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <input
                      key={i}
                      id={`otp-signup-${i}`}
                      type="text"
                      maxLength="1"
                      className="w-14 h-16 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-black text-secondary focus:outline-none focus:border-primary focus:bg-white transition-all"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        const finalOtp = newOtp.join("");
                        setOtp(finalOtp);

                        if (val && i < 3) {
                          const next = document.getElementById(
                            `otp-signup-${i + 1}`,
                          );
                          next && next.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const prev = document.getElementById(
                            `otp-signup-${i - 1}`,
                          );
                          prev && prev.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (step === 1
                  ? formData.mobile.length !== 10 || formData.name.length <= 2
                  : otp.length !== 4)}
                className={`w-full bg-secondary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                {loading
                  ? "Processing..."
                  : step === 1
                    ? "Create Account"
                    : "Verify & Finish"}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login Now
                </Link>
              </p>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <ShieldCheck size={14} className="text-accent" /> 100% Secure &
                Private
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
          By joining, you agree to our <br />
          <Link to="/terms" className="text-secondary hover:underline">
            Terms of Service
          </Link>{" "}
          &{" "}
          <Link to="/privacy" className="text-secondary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
