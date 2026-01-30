import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  // 🖼️ PHOTO UPLOAD
  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setLoading(true);
      const res = await API.put(
        "/api/user/profile-photo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setUser(res.data);
      toast.success("Profile photo updated");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ NAME UPDATE
  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await API.put("/api/user/profile", { name });
      setUser(res.data);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6 mb-6">
        <img
          src={user?.avatar || "/avatar.jpg"}
          className="w-24 h-24 rounded-full object-cover border"
        />

        <label className="cursor-pointer">
          <input type="file" hidden onChange={handlePhotoChange} />
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Change Photo
          </span>
        </label>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="text-sm text-gray-500">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 p-3 border rounded-lg"
        />
      </div>

      {/* Email (read only) */}
      <div className="mb-6">
        <label className="text-sm text-gray-500">Email</label>
        <input
          value={user?.email}
          disabled
          className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
