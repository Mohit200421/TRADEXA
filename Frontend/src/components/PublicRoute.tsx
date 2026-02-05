import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  // 🚫 Logged-in users should not see login/register
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
