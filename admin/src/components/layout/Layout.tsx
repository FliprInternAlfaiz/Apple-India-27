

import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";

import { useState } from "react";
import { COLORS } from "../../assets/colors";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";


const Layout = () => {
  const [sidebar, setSidebar] = useState(false);
  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: !sidebar ? "206px" : "60px",
        breakpoint: "xs",
      }}
      padding="md"
      styles={{ navbar: { transition: "all .5s" } }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Navbar bg={COLORS.primary}>
        <Sidebar hidden={sidebar} toggleSidebar={() => setSidebar((e) => !e)} />
      </AppShell.Navbar>
      <AppShell.Main pt={60} pr={0} pb={0} ml={10}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
