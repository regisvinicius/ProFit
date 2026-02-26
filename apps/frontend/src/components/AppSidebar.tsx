import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";

export function AppSidebar() {
	const { logout } = useAuth();
	const { t } = useI18n();
	const navigate = useNavigate();
	const { location } = useRouterState();
	const isHome = location.pathname === "/";

	function handleLogout() {
		logout();
		navigate({ to: "/login" });
	}

	return (
		<aside className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
			<nav className="flex flex-1 flex-col gap-1 p-3" aria-label={t("menu")}>
				<span className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
					{t("menu")}
				</span>
				<Link
					to="/"
					className={`rounded px-3 py-2 text-sm ${
						isHome
							? "bg-neutral-200 font-medium text-neutral-900"
							: "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
					}`}
				>
					{t("home")}
				</Link>
			</nav>
			<div className="border-t border-neutral-200 p-3">
				<button
					type="button"
					onClick={handleLogout}
					className="w-full rounded px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900"
				>
					{t("logout")}
				</button>
			</div>
		</aside>
	);
}
