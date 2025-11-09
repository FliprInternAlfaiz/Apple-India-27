import { Box, Burger } from "@mantine/core";
import classes from "./sidebar.module.scss";
import React, { memo } from "react";
import SidebarMenu from "./SidebarMenu";

interface IProps {
  hidden: boolean;
  toggleSidebar: () => void;
}

const Drawer: React.FC<IProps> = ({ hidden, toggleSidebar }) => {
  return (
    <Box
      p={"1rem"}
      className={`${classes.root} ${!hidden && classes.activeNav}`}
    >
      <Box mb={15}>
        <Burger
          opened={!hidden}
          onClick={toggleSidebar}
          size={18}
          color={"white"}
        />
      </Box>
      <Box>
        <SidebarMenu showLogo={!hidden} />
      </Box>
    </Box>
  );
};

const Sidebar = memo(Drawer);

export default Sidebar;
