import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Check, 
  UserPlus, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
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
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
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
  
      await API.post("/auth/register", registerData);
  
      toast.success("Account created successfully. Please login.");
      navigate("/login", { replace: true });
  
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const benefits = [
    "Track performance metrics",
    "Set and achieve goals",
    "Real-time analytics",
    "Bank-level security"
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="h-full flex flex-col lg:flex-row">
        {/* Left Side - Benefits (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 p-8 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl"></div>
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
                  <p className="text-emerald-100/80 text-sm">
                    Professional Trading Analytics
                  </p>
                </div>
              </Link>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center">
              <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-3 border border-white/20">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span className="text-xs text-white font-medium">
                      Join 10,000+ successful traders
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Start Your Trading Journey
                  </h2>
                  <p className="text-emerald-100/80">
                    Professional platform designed to help traders improve their performance
                  </p>
                </div>

                {/* Benefits List */}
                <div className="mb-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-emerald-100/90 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Testimonial */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                  <p className="text-white/90 text-sm mb-1 italic">
                    "TradeXA helped me identify patterns I was missing."
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-100/70 text-xs">
                      Michael Rodriguez, Full-time Trader
                    </span>
                    <div className="flex text-yellow-300 text-xs">
                      {"★".repeat(5)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="h-12 flex items-center border-t border-white/10">
              <p className="text-emerald-100/60 text-xs">
                © {new Date().getFullYear()} TradeXA • Secure Trading Platform
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Compact Register Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    TRADEXA
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    Professional Trading Analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Form Container - Card only on desktop */}
            <div className="lg:bg-white lg:dark:bg-gray-800 lg:rounded-xl lg:shadow-lg lg:border lg:border-gray-200 lg:dark:border-gray-700 lg:p-6">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Start your trading journey with professional analytics
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                             rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                             focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent 
                             transition-all duration-150 text-sm"
                    placeholder="Enter your full name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                             rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                             focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent 
                             transition-all duration-150 text-sm"
                    placeholder="Enter your email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full p-2.5 pr-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                               rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                               focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent 
                               transition-all duration-150 text-sm"
                      placeholder="Create a strong password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                               transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Strength: {getPasswordStrengthText(passwordStrength)}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`w-1.5 h-1.5 rounded-full ${
                              level <= passwordStrength
                                ? level <= 2 ? "bg-red-500" :
                                  level === 3 ? "bg-yellow-500" : "bg-green-500"
                                : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full p-2.5 pr-9 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                               rounded text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                               focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent 
                               transition-all duration-150 text-sm"
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-0.5 
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                               transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-0.5">Passwords do not match</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-0.5 w-3.5 h-3.5 text-emerald-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 
                             rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:ring-1"
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                    I agree to the{" "}
                    <Link to="/terms" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white 
                           rounded font-semibold hover:opacity-90 transition-all duration-150 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center justify-center gap-1.5 
                           text-sm shadow-sm hover:shadow"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <span className="px-2 text-xs text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>

              {/* Sign In Link */}
              <Link
                to="/login"
                className="block w-full py-2 bg-transparent border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                         rounded font-medium transition-all duration-150 hover:border-gray-400 
                         dark:hover:border-gray-500 text-center text-sm"
              >
                Sign In to Existing Account
              </Link>

              {/* Footer Note */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                  Secure registration • Data encrypted • © {new Date().getFullYear()} TradeXA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}