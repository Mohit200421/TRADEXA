import { useState } from "react";
import { Eye, EyeOff, LogIn, Mail, Lock, Sun, Moon } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await API.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      // Also store user info if available
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      toast.success("Login Successful! 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials for easy testing
  const handleDemoLogin = () => {
    setForm({
      email: "demo@tradefx.com",
      password: "demotrader123"
    });
    toast.success("Demo credentials loaded! Click Login to continue.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
        )}
      </button>

      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                TradeFX
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Professional Trading Journal</p>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-300">Sign in to your trading journal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="trader@example.com"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Demo Credentials Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-lg hover:shadow-xl"
            >
              Load Demo Credentials
            </button>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>

            {/* Demo Login Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Demo login available for testing purposes
              </p>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">New to TradeFX?</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all group"
            >
              Create an Account
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Features Highlight */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Why TradeFX?</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { text: "Advanced Analytics", icon: "📊" },
                { text: "Trade Replay", icon: "🎮" },
                { text: "Risk Management", icon: "🛡️" },
                { text: "Cloud Storage", icon: "☁️" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-x-4">
          <Link to="/privacy" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Terms of Service
          </Link>
          <span className="text-gray-400">•</span>
          <Link to="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Contact
          </Link>
        </div>

        {/* Version */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">TradeFX Pro v1.0 • Professional Trading Journal</p>
        </div>
      </div>
    </div>
  );
}