import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthUser } from "backend/schemas/auth";
import { describe, expect, it, vi } from "vitest";
import { Home } from "../../src/pages/Home.tsx";

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

const mockUser: AuthUser = {
	id: 1,
	email: "user@example.com",
	createdAt: "",
};

vi.mock("../../src/contexts/AuthContext", () => ({
	useAuth: () => ({
		state: {
			status: "authenticated",
			user: mockUser,
			accessToken: "at",
		},
		logout: mockLogout,
	}),
}));

const enStrings: Record<string, string> = {
	menu: "Menu",
	home: "Home",
	logout: "Log out",
	workInProgress: "Work in progress",
	loading: "Loading",
	language: "Language",
};
vi.mock("../../src/contexts/I18nContext", () => ({
	useI18n: () => ({
		t: (key: string) => enStrings[key] ?? key,
		locale: "en",
		setLocale: vi.fn(),
	}),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
	useRouterState: () => ({ location: { pathname: "/" } }),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}));

describe("Home", () => {
	it("shows logged-in user email in header", () => {
		render(<Home />);
		expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
	});

	it("shows WIP and loading bar in main area", () => {
		render(<Home />);
		expect(screen.getByText(/work in progress/i)).toBeInTheDocument();
		expect(screen.getByLabelText(enStrings.loading)).toBeInTheDocument();
	});

	it("shows logout in sidebar and calls logout and navigate on click", async () => {
		render(<Home />);
		const btn = screen.getByRole("button", { name: /log out/i });
		await userEvent.click(btn);
		expect(mockLogout).toHaveBeenCalled();
		expect(mockNavigate).toHaveBeenCalledWith({ to: "/login" });
	});
});
