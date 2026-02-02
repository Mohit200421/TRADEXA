import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, updateProfile } from "../api/profileApi";
import { useProfile } from "../contexts/ProfileContext";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let savedProfile;
      if (profile) {
        savedProfile = await updateProfile(form);
      } else {
        savedProfile = await createProfile(form);
      }

      setProfile(savedProfile);
      navigate("/profile");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-slate-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">
        {profile ? "Edit Profile" : "Create Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
        />

        <Input
          label="Username"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Bio"
          name="bio"
          value={form.bio}
          onChange={handleChange}
        />

        <Select
          label="Experience Level"
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
          options={["Beginner", "Intermediate", "Pro"]}
        />

        <Select
          label="Primary Market"
          name="primaryMarket"
          value={form.primaryMarket}
          onChange={handleChange}
          options={["Forex", "Crypto", "Stocks", "Indices", "Commodities"]}
        />

        <Select
          label="Trading Style"
          name="tradingStyle"
          value={form.tradingStyle}
          onChange={handleChange}
          options={["Scalping", "Intraday", "Swing", "Position"]}
        />

        <Input
          label="Account Currency"
          name="accountCurrency"
          value={form.accountCurrency}
          onChange={handleChange}
        />

        <Select
          label="Default Lot Type"
          name="defaultLotType"
          value={form.defaultLotType}
          onChange={handleChange}
          options={["Micro", "Mini", "Standard"]}
        />

        <Input
          label="Risk Per Trade (%)"
          type="number"
          name="riskPerTrade"
          value={form.riskPerTrade}
          onChange={handleChange}
        />

        <Input
          label="Timezone"
          name="timezone"
          value={form.timezone}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-gray-700"
    />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <textarea
      {...props}
      rows={3}
      className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-gray-700"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm mb-1">{label}</label>
    <select
      {...props}
      className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-gray-700"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default EditProfile;
