import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Check, 
  UserPlus,  // This was missing!
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

  const getStrengthColor = (level: number, strength: number) => {
    if (level > strength) return "bg-gray-300 dark:bg-gray-600";
    if (strength <= 2) return "bg-red-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                TradeXA
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Trading Analytics Platform
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content - Centered Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your trading journey with professional analytics
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-shadow text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-shadow text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-shadow text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Password strength:
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= passwordStrength
                            ? level <= 2 
                              ? "bg-red-500" 
                              : level === 3 
                                ? "bg-yellow-500" 
                                : "bg-green-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Number</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">Special char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-shadow text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 dark:bg-gray-900 dark:border-gray-700"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{" "}
                <Link to="/terms" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Secure registration • Data encrypted
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} TradeXA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}