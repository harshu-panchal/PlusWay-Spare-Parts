import React, { useState, useRef, useEffect } from "react";
import { Smartphone, ShieldCheck, Lock, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { registerFCMToken } from "../../../services/pushNotificationService";
import CountryCodePicker from "../../../components/CountryCodePicker";
import {
  DEFAULT_COUNTRY,
  STORAGE_KEY,
  getCountryByIso,
  getMaxLength,
  isMobileValidForCountry,
} from "../../../data/countryCodes";

const Login = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [country, setCountry] = useState(() => {
    try {
      return getCountryByIso(localStorage.getItem(STORAGE_KEY));
    } catch {
      return DEFAULT_COUNTRY;
    }
  });
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Persist the chosen country so it stays selected across sessions.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, country.code);
    } catch {
      // Storage may be unavailable (private mode / SSR); ignore.
    }
  }, [country]);

  const mobileMaxLength = getMaxLength(country);
  const mobileIsValid = isMobileValidForCountry(mobile, country);

  // Clamp the existing input if the user picks a country with a shorter max.
  const handleCountryChange = (next) => {
    setCountry(next);
    const nextMax = getMaxLength(next);
    setMobile((m) => m.slice(0, nextMax));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (mobileIsValid) {
      setLoading(true);
      setError("");
      try {
        await axios.post(API_ENDPOINTS.CUSTOMER_SEND_OTP, {
          mobile,
          type: "login",
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
          mobile,
          otp,
        });

        // If verification is successful, proceed to login
        const { data } = await axios.post(API_ENDPOINTS.CUSTOMER_LOGIN, {
          mobile,
          otp,
        });

        // Store customer info and token
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        // Register FCM token
        registerFCMToken(true);

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
                : `OTP sent to ${country.dial} ${mobile}`}
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
                  <div className="flex items-stretch bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-primary transition-all overflow-hidden">
                    <div className="flex items-center pl-2 pr-1 border-r border-gray-200">
                      <CountryCodePicker
                        value={country}
                        onChange={handleCountryChange}
                      />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      placeholder="Enter mobile number"
                      className="flex-1 min-w-0 px-4 py-4 bg-transparent focus:outline-none font-black tracking-widest text-secondary"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, mobileMaxLength),
                        )
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 justify-between">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      // type="tel" + inputMode="numeric" + pattern keeps the
                      // Android numeric keypad open across each per-digit
                      // box; type="text" defaults to alphabetic on every
                      // focus jump. autoComplete="one-time-code" enables
                      // iOS SMS autofill and Android's SMS Retriever hooks.
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      maxLength={1}
                      className="w-14 h-16 bg-gray-50 border border-gray-200 rounded-2xl text-center text-2xl font-black text-secondary focus:outline-none focus:border-primary focus:bg-white transition-all"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        const finalOtp = newOtp.join("");
                        setOtp(finalOtp);

                        if (val && i < 3) {
                          inputRefs.current[i + 1].focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          inputRefs.current[i - 1].focus();
                        }
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || (step === 1 ? !mobileIsValid : otp.length !== 4)
                }
                className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-secondary/20">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? "Send Code" : "Verify Code"}
                    <ChevronRight size={18} strokeWidth={3} />
                  </>
                )}
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
