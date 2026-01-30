import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthResponse } from "backend/schemas/auth";
import { describe, expect, it, vi } from "vitest";
import { login } from "../api/auth";
import { Login } from "./Login";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    setAuth: vi.fn(),
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

const mockLogin = vi.mocked(login);

describe("Login", () => {
  it("renders form with email, password and submit button", () => {
    render(<Login />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("shows error on failed login", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
    const user = userEvent.setup();
    render(<Login />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/senha/i), "pass");
    await user.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /invalid credentials/i,
      );
    });
  });

  it("calls login with email and password on submit", async () => {
    const mockAuthResponse: AuthResponse = {
      user: { id: 1, email: "a@b.com", createdAt: "" },
      accessToken: "at",
      refreshToken: "rt",
    };
    mockLogin.mockResolvedValueOnce(mockAuthResponse);
    const user = userEvent.setup();
    render(<Login />);
    await user.type(screen.getByLabelText(/email/i), "a@b.com");
    await user.type(screen.getByLabelText(/senha/i), "pass");
    await user.click(screen.getByRole("button", { name: /entrar/i }));
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "pass",
      });
    });
  });
});
