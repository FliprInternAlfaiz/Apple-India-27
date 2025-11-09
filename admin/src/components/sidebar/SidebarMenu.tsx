import React from "react";
import { Flex, Text } from "@mantine/core";
import MImage from "../../@ui/MImage";
import SidebarMenuItem from "./SidebarMenuItem";
import { navs } from "./navs";
import classes from "./sidebar.module.scss";
import { FaApple } from "react-icons/fa";
interface Iprops {
  showLogo: boolean;
}
const SidebarMenu: React.FC<Iprops> = ({ showLogo }) => {
  return (
    <Flex
      direction={"column"}
      gap={10}
      justify={"center"}
      align={"center"}
      w={"100%"}
    >
      {showLogo && (
        <Flex
          align="center"
          justify="center"
          className={classes.logoContainer}
        >
          <FaApple className={classes.logoIcon} />
          <Text className={classes.logoText}>Admin</Text>
        </Flex>
      )}

      {navs.map((item) => (
        <SidebarMenuItem key={item.label} item={item} showIcon={showLogo} />
      ))}
    </Flex>
  );
};

export default SidebarMenu;
