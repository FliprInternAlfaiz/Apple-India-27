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
import CompanyIntro from "../pages/company/CompanyIntro";
import CompanyActivities from "../pages/company/CompanyActivities";
import ConferenceNews from "../pages/company/ConferenceNews";
import MemberBenefits from "../pages/company/MemberBenefits";
import ManagementPositions from "../pages/company/ManagementPositions";
import TeamExpansion from "../pages/company/TeamExpansion";
import LuckyDraw from "../pages/company/LuckyDraw";
import FinanceFund from "../pages/company/FinanceFund";
import Recharge from "../pages/company/Recharge";
import IdentityAuth from "../pages/company/IdentityAuth";
import LevelTasksScreen from "../pages/LevelTasksScreen/LevelTaskScreen";



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
          { path: "/team-level-task", element: <LevelTasksScreen /> },
          { path: "/level", element: <Level /> },
          { path: "/profile", element: <Profile /> },
           { path: "/company-intro", element: <CompanyIntro /> },
          { path: "/company-activities", element: <CompanyActivities /> },
          { path: "/conference-news", element: <ConferenceNews /> },
          { path: "/member-benefits", element: <MemberBenefits /> },
          { path: "/management-positions", element: <ManagementPositions /> },
          { path: "/team-expansion", element: <TeamExpansion /> },
          { path: "/lucky-draw", element: <LuckyDraw /> },
          { path: "/finance-fund", element: <FinanceFund /> },
          { path: "/recharge", element: <Recharge /> },
          { path: "/identity-auth", element: <IdentityAuth /> },
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
