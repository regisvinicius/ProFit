import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  if (state.status !== "authenticated") {
    return null;
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen p-6">
      <p className="text-lg">
        Usuário <strong>{state.user.email}</strong> está logado.
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 px-4 py-2 border rounded"
      >
        Sair
      </button>
    </div>
  );
}
