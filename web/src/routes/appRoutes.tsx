import { createBrowserRouter } from "react-router-dom";
import TheLayout from "../layout/TheLayout";
import ProtectedRoute from "./ProtectedRoute";
import AuthRoute from "./AuthRoute";
import Home from "../pages/home/Home";
import Task from "../pages/task/Task";
import TeamManagement from "../pages/teamManagement/TeamManagement";
import Level from "../pages/level/Level";
import Profile from "../pages/profile/Profile";
import Login from "../pages/login/Login";
import Signup from "../pages/signup/Signup";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <TheLayout />, 
        children: [
          { path: "/", element: <Home /> },
          { path: "/task", element: <Task /> },
          { path: "/team", element: <TeamManagement /> },
          { path: "/level", element: <Level /> },
          { path: "/profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    element: <AuthRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
]);
