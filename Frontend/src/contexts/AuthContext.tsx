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

    if (!token) {
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        // ✅ Use /auth/me for authentication check (always returns user data if authenticated)
        const res = await API.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ Set user data from auth endpoint
        updateUser(res.data);
      } catch (err: any) {
        console.error("Auth restore failed:", err?.response?.status);

        // ❗ IMPORTANT: clear broken auth
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUserState(null);
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
