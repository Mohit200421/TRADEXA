import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🛑 Never redirect during auth restore
  if (loading) return null;

  // 🧠 Only redirect if user is TRULY logged out
  if (!user && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
