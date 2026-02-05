import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ShieldCheck, RefreshCw, TrendingUp } from "lucide-react";
import API from "../api/axios";

export default function VerifyEmailOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ email must come from register page
  const email = location.state?.email || "";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const inputsRef = useRef<HTMLInputElement[]>([]);

  /* =========================
     🔐 GUARD (CRITICAL FIX)
  ========================= */
  useEffect(() => {
    // 🚫 OTP page should NOT be accessible without email
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  /* =========================
     ⏱ COOLDOWN TIMER
  ========================= */
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /* =========================
     🔐 VERIFY OTP
  ========================= */
  const verifyOTP = async (otpValue: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/verify-email-otp", {
        email,
        otp: otpValue,
      });

      setSuccess(res.data.message);

      // ✅ After verification → login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🧠 AUTO SUBMIT
  ========================= */
  useEffect(() => {
    const joined = otp.join("");
    if (joined.length === 6 && !otp.includes("")) {
      verifyOTP(joined);
    }
  }, [otp]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const resendOTP = async () => {
    try {
      setError("");
      setSuccess("");

      await API.post("/auth/resend-email-otp", { email });
      setSuccess("New OTP sent to your email");
      setCooldown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-500 p-12 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TradeXA</h1>
              <p className="text-emerald-100 text-sm">
                Professional Trading Journal
              </p>
            </div>
          </Link>

          <div>
            <h2 className="text-3xl font-bold mb-4">
              Secure Email Verification
            </h2>
            <p className="text-emerald-100 max-w-md">
              We’ve sent a one-time password to your email to ensure account
              security.
            </p>
          </div>

          <p className="text-sm text-emerald-100">
            © {new Date().getFullYear()} TradeXA
          </p>
        </div>
      </div>

      {/* Right OTP Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Enter the 6-digit OTP sent to
            </p>
            <div className="flex items-center justify-center gap-2 mt-1 text-sm font-medium">
              <Mail className="w-4 h-4" />
              {email}
            </div>
          </div>

          {/* OTP Inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el!)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleBackspace(e, index)}
                className="w-12 h-14 text-xl text-center border rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            ))}
          </div>

          {loading && (
            <p className="text-center text-sm text-gray-500">
              Verifying OTP…
            </p>
          )}
          {error && <p className="text-center text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-center text-sm text-green-600">{success}</p>
          )}

          {/* Resend */}
          <button
            onClick={resendOTP}
            disabled={cooldown > 0}
            className="w-full flex items-center justify-center gap-2 text-sm text-emerald-600 disabled:text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
            {cooldown > 0
              ? `Resend OTP in ${cooldown}s`
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
