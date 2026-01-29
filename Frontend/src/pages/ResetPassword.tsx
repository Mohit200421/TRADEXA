import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async () => {
    const res = await API.post("/auth/reset-password", {
      token,
      password,
    });
    setMsg(res.data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-semibold">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-primary w-full" onClick={submit}>
          Reset Password
        </button>

        {msg && <p className="text-sm text-center">{msg}</p>}
      </div>
    </div>
  );
}
