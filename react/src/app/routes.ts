import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ReadEmail from "./pages/ReadEmail";
// import ChangePassword from "./pages/ChangePassword";
// import Settings from "./pages/Settings";
import Compose from "./pages/Compose";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "forgot-password", Component: ForgotPassword },
    ],
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path:"/readmail/:id",
     Component: ReadEmail,
  },
  //   path: "/change-password",
  //   Component: ChangePassword,
  // },
  // {
  //   path: "/settings",
  //   Component: Settings,
  // },
  {
    path: "/compose",
    Component: Compose,
  },
]);
