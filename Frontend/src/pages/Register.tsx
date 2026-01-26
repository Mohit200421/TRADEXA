import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Check, Sun, Moon, LogIn, UserPlus } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

export default function Register() {
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    confirmPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Check password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = form;
      const res = await API.post("/api/auth/register", registerData);
      localStorage.setItem("token", res.data.token);
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      toast.success("Account Created Successfully! 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength === 0) return "bg-gray-200 dark:bg-gray-700";
    if (strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const passwordRequirements = [
    { text: "At least 8 characters", met: form.password.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(form.password) },
    { text: "Contains number", met: /[0-9]/.test(form.password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-950 p-4">
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
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                TradeFX
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create Your Trading Journal</p>
            </div>
          </Link>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Join TradeFX</h2>
            <p className="text-gray-600 dark:text-gray-300">Start your trading journey with professional analytics</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="John Trader"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 0 ? "text-gray-500" :
                      passwordStrength <= 2 ? "text-red-500" :
                      passwordStrength === 3 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              {form.password && (
                <div className="space-y-1">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />
                      )}
                      <span className={`text-xs ${req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length >= 8 && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link to="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">Already have an account?</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl font-medium transition-all group"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Existing Account
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Features Highlight */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Get Started With</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { text: "Trade Analytics", icon: "📈" },
                { text: "Risk Tracking", icon: "🎯" },
                { text: "Chart Replay", icon: "🔄" },
                { text: "Multi-Account", icon: "👥" }
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
            Contact Support
          </Link>
        </div>

        {/* Version */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">TradeFX Pro v1.0 • Start Your Trading Journey Today</p>
        </div>
      </div>
    </div>
  );
}