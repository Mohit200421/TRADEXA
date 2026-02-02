import { useState } from "react";
import { uploadAvatar } from "../api/profileApi";
import { useProfile } from "../contexts/ProfileContext";
import defaultAvatar from "../assets/default-avatar.svg";

const AvatarUpload = () => {
  const { profile, reloadProfile } = useProfile();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentAvatar = preview || profile?.avatar?.url || defaultAvatar;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    setPreview(URL.createObjectURL(file));

    setLoading(true);
    try {
      await uploadAvatar(file);
      await reloadProfile(); // sync everywhere
      setPreview(null);
    } catch (error) {
      alert("Avatar upload failed");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={currentAvatar}
        alt="Avatar"
        className="w-28 h-28 rounded-full object-cover border"
      />

      <label className="cursor-pointer text-sm text-indigo-600 hover:underline">
        {loading ? "Uploading..." : "Change profile photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
          disabled={loading}
        />
      </label>
    </div>
  );
};

export default AvatarUpload;
