import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export function AuthLoader() {
  const { state } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.status === "loading") return;
    const isLogin = location.pathname === "/login";
    if (state.status === "unauthenticated" && !isLogin) {
      navigate({ to: "/login" });
      return;
    }
    if (state.status === "authenticated" && isLogin) {
      navigate({ to: "/" });
    }
  }, [state.status, location.pathname, navigate]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando…</p>
      </div>
    );
  }

  return <Outlet />;
}
