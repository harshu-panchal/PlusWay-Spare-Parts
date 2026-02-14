import React, { useState, useRef } from "react";
import { Smartphone, ShieldCheck, Lock, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const Login = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (mobile.length === 10) {
      setStep(2);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      if (otp !== "123456") {
        setError("Invalid OTP. Use 123456 for testing.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.post(
          API_ENDPOINTS.CUSTOMER_LOGIN,
          { mobile, otp },
        );

        // Store customer info and token
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        setLoading(false);
        navigate("/");
      } catch (err) {
        setError(
          err.response?.data?.message || "Login failed. Please try again.",
        );
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#f4f4f4] min-h-[calc(100vh-160px)] flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 lg:p-14">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-primary mb-8 mx-auto shadow-sm">
              {step === 1 ? <Smartphone size={32} /> : <Lock size={32} />}
            </div>

            <h1 className="text-3xl font-black text-secondary mb-2 uppercase italic tracking-tighter text-center">
              {step === 1 ? "WELCOME " : "VERIFY "}
              <span className="text-primary italic">
                {step === 1 ? "BACK" : "CODE"}
              </span>
            </h1>
            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em] text-center mb-6">
              {step === 1
                ? "Login with mobile number"
                : `OTP sent to +91 ${mobile}`}
            </p>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6 border border-red-100">
                {error}
              </div>
            )}

            <form
              onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP}
              className="space-y-6">
              {step === 1 ? (
                <div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 pr-3 h-6">
                      <span className="text-xs font-black text-secondary">
                        +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Enter mobile number"
                      className="w-full pl-20 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary font-black tracking-widest text-secondary transition-all"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength="1"
                      className="w-full aspect-square text-center bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-black text-xl text-secondary"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/[0-9]/.test(val)) {
                          const newOtp = otp.substring(0, i) + val + otp.substring(i + 1);
                          setOtp(newOtp);
                          // Focus next input
                          if (i < 5) {
                            document.getElementById(`otp-${i + 1}`).focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                          if (!otp[i] && i > 0) {
                            // If current is empty and backspace pressed, go to previous
                            document.getElementById(`otp-${i - 1}`).focus();
                          } else {
                            // Clear current digit
                            const newOtp = otp.substring(0, i) + otp.substring(i + 1);
                            setOtp(newOtp);
                          }
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-secondary text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                {loading
                  ? "Processing..."
                  : step === 1
                    ? "Send OTP"
                    : "Verify & Continue"}
                {!loading && <ChevronRight size={18} />}
              </button>
            </form>

            {step === 1 && (
              <div className="mt-8 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline">
                    Signup Now
                  </Link>
                </p>
              </div>
            )}

            <div className="mt-10 pt-10 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <ShieldCheck size={14} className="text-accent" /> 100% Secure &
                Private
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">
          By continuing, you agree to Plusway's <br />
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

export default Login;
