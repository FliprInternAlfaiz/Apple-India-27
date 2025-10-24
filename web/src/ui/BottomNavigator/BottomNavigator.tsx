import { Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaUsers, FaCrown, FaUser } from "react-icons/fa";
import styles from "./BottomNavigator.module.scss";

const BottomNavigator = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { icon: FaHome, path: "/", label: "Home" },
    { icon: FaTasks, path: "/task", label: "Task" },
    { icon: FaUsers, path: "/team", label: "Team" },
    { icon: FaCrown, path: "/level", label: "Level" },
    { icon: FaUser, path: "/profile", label: "My" },
  ];

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
              onClick={() => navigate(tab.path)}
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
