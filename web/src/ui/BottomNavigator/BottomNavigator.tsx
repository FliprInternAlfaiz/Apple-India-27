"use client";

import { Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaUsers, FaCrown, FaUser } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./BottomNavigator.module.scss";

const BottomNavigator = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const tabs = [
    { icon: FaHome, path: "/", label: "Home" },
    { icon: FaTasks, path: "/task", label: "Task" },
    { icon: FaUsers, path: "/team", label: "Team" },
    { icon: FaCrown, path: "/level", label: "Level" },
    { icon: FaUser, path: "/profile", label: "My" },
  ];

  const handleTabClick = async (path: string) => {
    navigate(path);

    switch (path) {
      case "/profile":
        // Refetch verification status query
        await queryClient.invalidateQueries({ queryKey: ["verifyUser"] });
        break;

      case "/level":
        await queryClient.invalidateQueries({ queryKey: ["allLevels"] });
        break;

      case "/team":
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["team-stats"] }),
          queryClient.invalidateQueries({ queryKey: ["referral-link"] }),
          queryClient.invalidateQueries({ queryKey: ["team-members"] }),
        ]);
        break;

      case "/task":
        // Refetch infinite tasks query
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        break;

      default:
        break;
    }
  };

  return (
    <div className={styles.footerWrapper}>
      <Flex justify="space-around" align="center" className={styles.footer}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;

          return (
            <Flex
              key={tab.path}
              direction="column"
              align="center"
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => handleTabClick(tab.path)}
            >
              <Icon className={styles.icon} />
              <span className={styles.label}>{tab.label}</span>
            </Flex>
          );
        })}
      </Flex>
    </div>
  );
};

export default BottomNavigator;
