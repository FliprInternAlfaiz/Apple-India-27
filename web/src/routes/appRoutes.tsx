import { createBrowserRouter } from "react-router-dom";
import TheLayout from "../layout/TheLayout";
import Home from "../pages/home/Home";
import Task from "../pages/task/Task";
import TeamManagement from "../pages/teamManagement/TeamManagement";
import Level from "../pages/level/Level";
import Profile from "../pages/profile/Profile";
import Login from "../pages/login/Login";
import Signup from "../pages/signup/Signup";

import ProtectedRoute from "./ProtectedRoute";
import { ROUTES } from "../enum/routes";
import AuthRoute from "./AuthRoute";

export const appRouter = createBrowserRouter([
  {
    element: <AuthRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <Login /> },
      { path: ROUTES.SIGNUP, element: <Signup /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <TheLayout />,
        children: [
          { path: ROUTES.HOMEPAGE, element: <Home /> },
          { path: "/task", element: <Task /> },
          { path: "/team", element: <TeamManagement /> },
          { path: "/level", element: <Level /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
]);
