import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, updateProfile } from "../api/profileApi";
import { useProfile } from "../contexts/ProfileContext";
import {
  User,
  Tag,
  BookOpen,
  TrendingUp,
  Target,
  DollarSign,
  Shield,
  Globe,
  Save,
  ArrowLeft,
  Loader2
} from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfile();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    bio: "",
    experienceLevel: "Beginner",
    primaryMarket: "",
    tradingStyle: "",
    accountCurrency: "USD",
    defaultLotType: "Micro",
    riskPerTrade: 1,
    timezone: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        username: profile.username || "",
        bio: profile.bio || "",
        experienceLevel: profile.experienceLevel || "Beginner",
        primaryMarket: profile.primaryMarket || "",
        tradingStyle: profile.tradingStyle || "",
        accountCurrency: profile.accountCurrency || "USD",
        defaultLotType: profile.defaultLotType || "Micro",
        riskPerTrade: profile.riskPerTrade || 1,
        timezone: profile.timezone || "",
      });
    }
  }, [profile]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let savedProfile;
      if (profile) {
        savedProfile = await updateProfile(form);
      } else {
        savedProfile = await createProfile(form);
      }

      setProfile(savedProfile);
      navigate("/profile");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                     hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile ? "Edit Profile" : "Create Profile"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile ? "Update your trading profile" : "Set up your trader profile"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Personal Information
              </h2>
              
              <Input
                icon={<User className="w-5 h-5" />}
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <Input
                icon={<Tag className="w-5 h-5" />}
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />

              <Textarea
                icon={<BookOpen className="w-5 h-5" />}
                label="Bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about your trading experience and philosophy..."
              />
            </div>

            {/* Trading Preferences Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Trading Preferences
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Experience Level"
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  options={["Beginner", "Intermediate", "Advanced", "Professional"]}
                />

                <Select
                  icon={<Target className="w-5 h-5" />}
                  label="Primary Market"
                  name="primaryMarket"
                  value={form.primaryMarket}
                  onChange={handleChange}
                  options={["Forex", "Crypto", "Stocks", "Indices", "Commodities", "Futures", "Options"]}
                />

                <Select
                  icon={<Target className="w-5 h-5" />}
                  label="Trading Style"
                  name="tradingStyle"
                  value={form.tradingStyle}
                  onChange={handleChange}
                  options={["Scalping", "Day Trading", "Swing Trading", "Position Trading", "Algorithmic"]}
                />

                <Select
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Default Lot Type"
                  name="defaultLotType"
                  value={form.defaultLotType}
                  onChange={handleChange}
                  options={["Micro", "Mini", "Standard"]}
                />
              </div>
            </div>

            {/* Risk & Settings Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Risk & Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  icon={<Shield className="w-5 h-5" />}
                  label="Risk Per Trade (%)"
                  type="number"
                  name="riskPerTrade"
                  value={form.riskPerTrade}
                  onChange={handleChange}
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <Input
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Account Currency"
                  name="accountCurrency"
                  value={form.accountCurrency}
                  onChange={handleChange}
                  placeholder="e.g., USD, EUR, GBP"
                />

                <Select
                  icon={<Globe className="w-5 h-5" />}
                  label="Timezone"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  options={[
                    "UTC",
                    "EST (New York)",
                    "PST (Los Angeles)",
                    "GMT (London)",
                    "CET (Frankfurt)",
                    "AEST (Sydney)",
                    "JST (Tokyo)",
                    "SGT (Singapore)"
                  ]}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                         rounded-xl font-semibold hover:opacity-90 transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center 
                         justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {profile ? "Update Profile" : "Create Profile"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={isSubmitting}
                className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                         rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 
                      rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Profile Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Complete all fields for better personalized insights</li>
            <li>• Set realistic risk percentages (1-2% recommended)</li>
            <li>• Your bio helps other traders understand your approach</li>
            <li>• You can update your profile anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Enhanced Input Component
const Input = ({ icon, label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                   ${icon ? 'pl-10' : ''}
                   disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  </div>
);

// Enhanced Textarea Component
const Textarea = ({ icon, label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3 text-gray-400">
          {icon}
        </div>
      )}
      <textarea
        {...props}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                   ${icon ? 'pl-10' : ''}
                   disabled:opacity-50 disabled:cursor-not-allowed`}
        rows={4}
      />
    </div>
  </div>
);

// Enhanced Select Component
const Select = ({ icon, label, options, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <select
        {...props}
        className={`w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all
                   ${icon ? 'pl-10' : ''}
                   disabled:opacity-50 disabled:cursor-not-allowed
                   appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDE0IDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNyA3TDEzIDEiIHN0cm9rZT0iIzlDQTBCNiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg==')] bg-no-repeat bg-[center_right_1rem]`}
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default EditProfile;