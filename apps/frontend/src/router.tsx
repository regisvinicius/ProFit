import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AuthLoader } from "./components/AuthLoader";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";

const rootRoute = createRootRoute({
  component: AuthLoader,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
