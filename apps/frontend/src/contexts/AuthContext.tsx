import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { me } from "../api/auth";
import type { AuthUser } from "../api/auth";

const ACCESS_KEY = "profit_access_token";
const REFRESH_KEY = "profit_refresh_token";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser; accessToken: string };

type AuthContextValue = {
  state: AuthState;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const access = localStorage.getItem(ACCESS_KEY);
    if (!access) return { status: "unauthenticated" as const };
    return { status: "loading" as const };
  });

  useEffect(() => {
    if (state.status !== "loading") return;
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      setState({ status: "unauthenticated" });
      return;
    }
    me(token)
      .then((user) => {
        setState({ status: "authenticated", user, accessToken: token });
      })
      .catch(() => {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setState({ status: "unauthenticated" });
      });
  }, [state.status]);

  const setAuth = useCallback(
    (user: AuthUser, accessToken: string, refreshToken: string) => {
      localStorage.setItem(ACCESS_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
      setState({ status: "authenticated", user, accessToken });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setState({ status: "unauthenticated" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      accessToken: state.status === "authenticated" ? state.accessToken : null,
      setAuth,
      logout,
    }),
    [state, setAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
