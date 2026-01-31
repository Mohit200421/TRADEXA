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

    API.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("Email verified successfully 🎉 You can now login."))
      .catch(() =>
        setStatus("Invalid or expired verification link")
      );
  }, [params]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">{status}</p>
    </div>
  );
}
