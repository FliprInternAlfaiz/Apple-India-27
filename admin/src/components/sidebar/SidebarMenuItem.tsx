import React from "react";
import { NavLink } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";

import classes from "./sidebar.module.scss";
import type { NavProps } from "./navs";

interface Iprops {
  item: NavProps;
  showIcon: boolean;
}
const SidebarMenuItem: React.FC<Iprops> = ({ item, showIcon }) => {
  const location = useLocation();
  const isActive = location.pathname === item?.to;
  const navigate = useNavigate();
  const Icon = item.icon;

  return (
    <NavLink
      classNames={{
        root: `${classes.sidebar_menu_item_root} ${
          isActive ? classes.active : ""
        }`,
        label: `${classes.sidebar_menu_item_label} ${
          isActive ? classes.activeLabel : ""
        }`,
        body: classes.sidebar_menu_item_body,
      }}
      label={showIcon ? item.label : ""}
      leftSection={
        <Icon
          className={`${classes.leftIcon} ${
            isActive ? classes.iconActive : ""
          }`}
          stroke={1.5}
          size={20}
        />
      }
      onClick={() => navigate(item?.to)}
    />
  );
};

export default SidebarMenuItem;
