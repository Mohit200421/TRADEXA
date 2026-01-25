import { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/auth/register", form);
      localStorage.setItem("token", res.data.token);
      toast.success("Registered Successfully ✅");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-[380px]"
      >
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <button className="w-full bg-black text-white py-2 rounded">
          Register
        </button>

        <p className="mt-3 text-sm">
          Already have account?{" "}
          <Link className="text-blue-600" to="/">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
