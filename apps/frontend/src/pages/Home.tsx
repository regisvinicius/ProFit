import { MainLayout } from "../components/MainLayout";
import { WipScreen } from "../components/WipScreen";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
	const { state } = useAuth();

	if (state.status !== "authenticated") {
		return null;
	}

	return (
		<MainLayout user={state.user}>
			<WipScreen />
		</MainLayout>
	);
}
