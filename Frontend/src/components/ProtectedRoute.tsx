import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ⏳ Wait until auth restoration finishes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  // 🔒 Not logged in → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
