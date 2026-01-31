import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: any) {
  const { user, loading } = useAuth();

  if (loading) return null; // optional loader

  // ✅ FIX: remove replace
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
