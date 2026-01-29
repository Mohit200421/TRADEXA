import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("/api/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔐 LOGOUT (NO navigate here ❌)
  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null); // ✅ clear auth state
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
