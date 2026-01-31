import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh (MAIN FIX)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // ❌ /api/auth/me
        // ✅ /auth/me  (because baseURL already has /api)
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔐 LOGOUT
  const logout = async () => {
    try {
      // ❌ /api/auth/logout
      // ✅ /auth/logout
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
