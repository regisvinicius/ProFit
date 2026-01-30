import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthUser } from "backend/schemas/auth";
import { describe, expect, it, vi } from "vitest";
import { Home } from "./Home";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

const mockUser: AuthUser = {
  id: 1,
  email: "user@example.com",
  createdAt: "",
};

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    state: {
      status: "authenticated",
      user: mockUser,
      accessToken: "at",
    },
    logout: mockLogout,
  }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Home", () => {
  it("shows logged-in user email", () => {
    render(<Home />);
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/está logado/)).toBeInTheDocument();
  });

  it("shows Sair button and calls logout and navigate on click", async () => {
    render(<Home />);
    const btn = screen.getByRole("button", { name: /sair/i });
    await userEvent.click(btn);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
  });
});
