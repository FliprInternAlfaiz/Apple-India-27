import {
  IconHome,
  IconUsers,
  IconListDetails,
  IconTrophy,
  IconHierarchy2,
  IconSettings,
  type IconProps,
  IconCash,
  IconWallet,
  IconCurrencyRupee,
  IconCurrencyDollar,
  IconAdjustmentsDollar,
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
  { icon: IconCash, label: "Recharge", to: ROUTES.RECHARGE },
  { icon: IconWallet, label: "Withdrawals", to: ROUTES.WITHDRAWAL },
  { icon: IconCurrencyDollar, label: "USD Withdrawals", to: ROUTES.USD_WITHDRAWAL },
  { icon: IconAdjustmentsDollar, label: "USD Settings", to: ROUTES.USD_WITHDRAWAL_SETTINGS },
  {
    icon: IconWallet,
    label: "Withdrawals-config",
    to: ROUTES.WITHDRAWAL_CONFIG,
  },
  {
    icon: IconCurrencyRupee,
    label: "Payment Methods",
    to: ROUTES.PAYMENT_METHOD,
  },
  {
    icon: IconListDetails,
    label: "Conference News",
    to: ROUTES.CONFERENCE_NEWS,
  },
  { icon: IconSettings, label: "Settings", to: ROUTES.SETTINGS },
];
