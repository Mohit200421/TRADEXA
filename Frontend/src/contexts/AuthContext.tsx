import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔒 This prevents re-running restore on back/forward
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        // ❗ DO NOTHING — do not logout on restore failure
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
