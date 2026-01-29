import { useState } from "react";
import API from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    const res = await API.post("/auth/forgot-password", { email });
    setMsg(res.data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btn-primary w-full" onClick={submit}>
          Send Reset Link
        </button>

        {msg && <p className="text-sm text-center">{msg}</p>}
      </div>
    </div>
  );
}
