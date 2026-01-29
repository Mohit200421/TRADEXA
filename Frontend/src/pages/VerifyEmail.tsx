import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("Invalid verification link");
      return;
    }

    API.get(`/api/auth/verify-email?token=${token}`)
      .then(() => setStatus("Email verified successfully 🎉"))
      .catch(() => setStatus("Invalid or expired verification link"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">{status}</p>
    </div>
  );
}
