import {
  IconHome,
  IconUsers,
  IconListDetails,
  IconTrophy,
  IconHierarchy2,
  IconSettings,
  type IconProps,
} from "@tabler/icons-react";
import { ROUTES } from "../../enum/routes";

export interface NavProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  to: string;
}

export const navs: NavProps[] = [
  { icon: IconHome, label: "Dashboard", to: ROUTES.DASHBOARD },
  { icon: IconUsers, label: "All Users", to: ROUTES.ALL_USERS },
  { icon: IconListDetails, label: "Tasks", to: ROUTES.TASKS },
  { icon: IconHierarchy2, label: "Teams", to: ROUTES.TEAMS },
  { icon: IconTrophy, label: "Levels", to: ROUTES.LEVELS },
  { icon: IconSettings, label: "Settings", to: ROUTES.SETTINGS },
];
