import { Link } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";
import AvatarUpload from "../components/AvatarUpload";

const Profile = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Complete Your Trader Profile
        </h2>
        <p className="text-gray-500 mb-6">
          Your profile helps personalize your trading experience.
        </p>
        <Link
          to="/profile/edit"
          className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Create Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-slate-900 rounded-xl shadow">
      {/* Header */}
      <div className="flex items-center gap-6">
        <AvatarUpload />

        <div>
          <h1 className="text-2xl font-bold">
            {profile.fullName || "Unnamed Trader"}
          </h1>
          <p className="text-gray-500">@{profile.username}</p>
          <p className="text-sm text-gray-400 mt-1">
            {profile.experienceLevel} Trader
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Info label="Primary Market" value={profile.primaryMarket} />
        <Info label="Trading Style" value={profile.tradingStyle} />
        <Info label="Account Currency" value={profile.accountCurrency} />
        <Info label="Default Lot Type" value={profile.defaultLotType} />
        <Info
          label="Risk Per Trade"
          value={profile.riskPerTrade ? `${profile.riskPerTrade}%` : undefined}
        />
        <Info label="Timezone" value={profile.timezone} />
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Bio</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8">
        <Link
          to="/profile/edit"
          className="inline-block px-6 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
};

type InfoProps = {
  label: string;
  value?: string;
};

const Info = ({ label, value }: InfoProps) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="font-medium">
      {value || <span className="text-gray-400">—</span>}
    </p>
  </div>
);

export default Profile;
