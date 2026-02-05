import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Check, UserPlus, TrendingUp, BarChart3, Shield, Cloud } from "lucide-react";
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

      // ✅ DIRECT REDIRECT TO LOGIN
      navigate("/login", { replace: true });
  
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed";
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

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Analytics",
      description: "Monitor your trading performance with live dashboards"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Chart Replay",
      description: "Practice trading strategies with historical data"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Storage",
      description: "Your trade data is encrypted and safely stored"
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Backup",
      description: "Access your journal from anywhere, anytime"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Logo */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TRADEXA</h1>
                <p className="text-emerald-100 text-sm">Professional Trading Journal</p>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Start Your Trading Journey
              </h2>
              <p className="text-emerald-100">
                Join a community of disciplined traders who track, analyze, and improve their performance systematically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white mb-3">{feature.icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                  <p className="text-emerald-100 text-xs">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-emerald-100 text-sm">
            <p>© {new Date().getFullYear()} TradeXA. All rights reserved.</p>
            <p className="text-xs mt-1">Professional Trading Analytics Platform</p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TRADEXA</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Professional Trading Journal</p>
              </div>
            </Link>
          </div>

          {/* Register Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
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
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your full name"
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
                    className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your email"
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
                    className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Create a strong password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
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

                {/* Password Strength */}
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
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3">
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
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="inline-block w-full py-3 bg-transparent border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl font-medium transition-all"
              >
                Sign In to Existing Account
              </Link>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-8 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>© {new Date().getFullYear()} TradeXA. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}