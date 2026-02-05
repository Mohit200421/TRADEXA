import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import API from "../api/axios";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const verify = async () => {
      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);

        // 🔥 AUTO LOGIN
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }

        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        setSuccess("Email verified. Logging you in…");

        // ✅ GO DIRECTLY TO DASHBOARD
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1200);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Invalid or expired verification link"
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            {error ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Email Verification
        </h2>

        {loading && (
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your email…
          </p>
        )}

        {success && (
          <p className="text-green-600 font-medium">{success}</p>
        )}

        {error && (
          <p className="text-red-500 font-medium">{error}</p>
        )}

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          TradeXA
        </div>
      </div>
    </div>
  );
}
