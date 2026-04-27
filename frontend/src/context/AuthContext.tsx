import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { login as apiLogin, register as apiRegister, type AuthUser } from "@/lib/auth-api";

const STORAGE_KEY = "arena_auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAuth(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = (next: StoredAuth | null) => {
    setAuth(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: !!auth,
    isAdmin: auth?.user?.role === "ADMIN",
    async login(email, password) {
      const r = await apiLogin(email, password);
      persist({ token: r.token, user: r.user });
    },
    async register(name, email, password) {
      const r = await apiRegister(name, email, password);
      persist({ token: r.token, user: r.user });
    },
    logout() { persist(null); },
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
