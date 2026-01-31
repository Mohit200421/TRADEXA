import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // ✅ Always wait for auth restore
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  // ✅ Redirect ONLY after loading is finished
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
