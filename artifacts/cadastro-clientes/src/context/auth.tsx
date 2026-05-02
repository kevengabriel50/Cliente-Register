import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  role: string | null;
  nome: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, role: string, nome: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem("auth_token"),
    role: localStorage.getItem("auth_role"),
    nome: localStorage.getItem("auth_nome"),
  }));

  useEffect(() => {
    setAuthTokenGetter(() => auth.token);
  }, [auth.token]);

  const login = (token: string, role: string, nome: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_nome", nome);
    setAuth({ token, role, nome });
  };

  const logout = () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_nome");
    setAuth({ token: null, role: null, nome: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        isAdmin: auth.role === "admin",
        isAuthenticated: !!auth.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
