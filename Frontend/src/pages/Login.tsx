import { useState } from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  TrendingUp,
  BarChart3,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { theme } = useTheme();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await API.post("/auth/login", form);

      if (!res.data?.token) {
        throw new Error("Token not received");
      }

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Track PnL, win rate, and risk metrics",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Trade Replay",
      description: "Test strategies with historical data",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Risk Management",
      description: "Monitor drawdowns & exposure",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Insights",
      description: "Learn from successful traders",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Side - Features (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-8 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col w-full">
            {/* Logo */}
            <div className="h-16">
              <Link 
                to="/" 
                className="inline-flex items-center gap-3"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className={`
                  w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl 
                  flex items-center justify-center 
                  transition-all duration-300 
                  ${isHovered ? 'scale-105 rotate-3' : ''}
                  border border-white/30
                `}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    TRADEXA
                  </h1>
                  <p className="text-blue-100/80 text-sm">
                    Professional Trading Analytics
                  </p>
                </div>
              </Link>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center">
              <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm text-white font-medium">
                      Trusted by 10,000+ traders
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Elevate Your Trading
                  </h2>
                  <p className="text-blue-100/80 text-lg">
                    Professional analytics platform for serious traders
                  </p>
                </div>

                {/* Compact Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white/20 rounded-lg">
                          <div className="text-white">
                            {feature.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {feature.title}
                          </h3>
                          <p className="text-blue-100/70 text-xs truncate">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-white/90 text-sm mb-1 italic">
                    "My win rate improved by 40% using TradeXA."
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100/70 text-xs">
                      Sarah Chen, Professional Trader
                    </span>
                    <div className="flex text-yellow-300 text-sm">
                      {"★".repeat(5)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="h-12 flex items-center border-t border-white/10">
              <p className="text-blue-100/60 text-sm">
                © {new Date().getFullYear()} TradeXA • Secure Trading Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    TRADEXA
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Professional Trading Analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl mb-3">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome Back
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sign in to continue to your dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                               rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-200 text-sm"
                      placeholder="Enter your email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                               transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      className="w-full p-3 pl-10 pr-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
                               rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                               transition-all duration-200 text-sm"
                      placeholder="Enter your password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                               transition-colors rounded"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                               focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                               focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                           rounded-lg font-semibold hover:opacity-90 transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center justify-center gap-2 
                           shadow-md hover:shadow-lg text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="px-3 text-xs text-gray-500 dark:text-gray-400">
                  Don't have an account?
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Register Link */}
              <div>
                <Link
                  to="/register"
                  className="block w-full py-2.5 bg-transparent border border-blue-500 
                           text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                           rounded-lg font-medium transition-all duration-200 hover:border-blue-600 
                           dark:hover:border-blue-400 text-sm text-center"
                >
                  Create New Account
                </Link>
              </div>

              {/* Mobile-only Footer */}
              <div className="lg:hidden mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By signing in, you agree to our{" "}
                  <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy
                  </Link>
                </p>
              </div>
            </div>

            {/* Desktop Footer */}
            <div className="hidden lg:block mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Secure login • Data encrypted • © {new Date().getFullYear()} TradeXA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}