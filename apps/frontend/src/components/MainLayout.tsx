import type { AuthUser } from "backend/schemas/auth";
import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

type MainLayoutProps = {
	user: AuthUser;
	children: ReactNode;
};

export function MainLayout({ user, children }: MainLayoutProps) {
	return (
		<div className="flex h-screen flex-col">
			<AppHeader user={user} />
			<div className="flex min-h-0 flex-1">
				<AppSidebar />
				<main className="min-w-0 flex-1 overflow-auto bg-white">
					{children}
				</main>
			</div>
		</div>
	);
}
