import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out ✅");
    navigate("/");
  };

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        toast.error("Session expired ❌");
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchMe();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {user ? (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <p className="font-semibold">Welcome, {user.name} 👋</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      ) : (
        <p className="mt-4">Loading...</p>
      )}
    </div>
  );
}
