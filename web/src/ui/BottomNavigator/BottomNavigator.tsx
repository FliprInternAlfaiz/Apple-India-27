import { Flex } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTasks, FaUsers, FaCrown, FaUser } from "react-icons/fa";
import styles from "./BottomNavigator.module.scss";

const BottomNavigator = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { icon: <FaHome size={20} />, path: "/", label: "Home" },
    { icon: <FaTasks size={20} />, path: "/task", label: "Task" },
    { icon: <FaUsers size={20} />, path: "/team", label: "Team" },
    { icon: <FaCrown size={20} />, path: "/level", label: "Level" },
    { icon: <FaUser size={20} />, path: "/Profile", label: "My" },
  ];

  return (
    <div className={styles.footerWrapper}>
      <Flex justify="space-around" align="center" className={styles.footer}>
        {tabs.map((tab) => (
          <Flex
            key={tab.path}
            direction="column"
            align="center"
            className={`${styles.tab} ${
              pathname === tab.path ? styles.active : ""
            }`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Flex>
        ))}
      </Flex>
    </div>
  );
};

export default BottomNavigator;
