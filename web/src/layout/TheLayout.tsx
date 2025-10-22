import { AppShell, Box } from "@mantine/core";
import { memo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNavigator from "../ui/BottomNavigator/BottomNavigator";
import Header from "../ui/Header/Header";

const TheLayout = () => {
  const [mobileOpened, setMobileOpened] = useState(false);
  const location = useLocation();
  const showHeader = ["/"].includes(location.pathname);

  return (
    <AppShell
      padding={0}
      styles={{
        root: {
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        },
        main: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: 0,
          margin: 0,
          width: "100%",
          boxSizing: "border-box",
        },
      }}
    >
            <Header mobileOpened={mobileOpened} toggleMobile={() => setMobileOpened(!mobileOpened)} />

      <Box style={{ flex: 1, width: "100%" }}>
        <Outlet />
      </Box>

      {/* Footer always at bottom */}
      <BottomNavigator />
    </AppShell>
  );
};

export default memo(TheLayout);
