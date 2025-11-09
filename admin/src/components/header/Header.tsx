import { Box, Flex, Tooltip } from "@mantine/core";
import React from "react";
import { COLORS } from "../../assets/colors";
import MImage from "../../@ui/MImage";
import { useLogoutMutation } from "../../hooks/mutations/useLogoutMutation";
import { useNavigate } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { ROUTES } from "../../enum/routes";

const Header: React.FC = () => {
  const { mutateAsync } = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await mutateAsync();
    if (res.status === "success") {
      notifications.show({
        title: "Logout successful!",
        message: "User has been logged out successful!",
        color: "green",
      });
      navigate(`${ROUTES.LOGIN}`);
    } else {
      notifications.show({
        title: "Internal Server Error",
        message: "Oops! Something went wrong , please try again later",
      });
    }
  };

  return (
    <Flex
      h={"100%"}
      justify="flex-end"
      align={"center"}
      pr={13}
      onClick={handleLogout}
    >
      <Box
        py={8}
        px={10}
        style={{
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        bg={COLORS.primary}
      >
       <Tooltip label="logout Admin">
         <MImage name="exitIcon" alt="exit icon" width={"16px"} />
       </Tooltip>
      </Box>
    </Flex>
  );
};

export default Header;
