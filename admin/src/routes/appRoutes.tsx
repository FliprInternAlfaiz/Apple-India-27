import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "../enum/routes";
import Login from "../pages/auth/login/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AllUsers from "../pages/allUsers/AllUsers";
import TaskManagement from "../pages/TaskManagement/TaskManagement";
import TeamManagement from "../pages/TeamManagment/TeamManagment";
import LevelManagement from "../pages/LevelManagment/LevelManagment";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (<ProtectedRoute />) as React.ReactNode,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.ALL_USERS,
        element: <AllUsers />,
      },
      {
        path: ROUTES.TASKS,
        element: <TaskManagement />,
      },
      {
        path: ROUTES.TEAMS,
        element: <TeamManagement />,
      },
      {
        path: ROUTES.LEVELS,
        element: <LevelManagement />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  }
]);
