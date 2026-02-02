import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import API from "../api/axios";

type AuthContextType = {
  user: any | null;
  setUser: (user: any | null) => void;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const restoredRef = useRef(false);

  /* =========================
     RESTORE AUTH STATE
  ========================= */
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // ✅ Restore user safely
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserState(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        const res = await API.get("/auth/me");
        updateUser(res.data);
      } catch {
        // do NOT crash or logout
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  /* =========================
     SAFE USER UPDATE
  ========================= */
  const updateUser = (userData: any | null) => {
    if (!userData) {
      setUserState(null);
      localStorage.removeItem("user");
      return;
    }

    setUserState(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   SAFE HOOK
========================= */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
