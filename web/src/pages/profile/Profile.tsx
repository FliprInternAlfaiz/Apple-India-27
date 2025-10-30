// components/Profile/Profile.tsx
import React, { useEffect } from "react";
import { Box, Text, Flex, Button, Divider, Loader, Center } from "@mantine/core";
import {
  FaBuilding,
  FaIdCard,
  FaFileAlt,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IMAGES } from "../../assets";
import type { RootState } from "../../store/store";
import { login } from "../../store/reducer/authSlice";
import { useVerifyUserQuery } from "../../hooks/query/useGetVerifyUser.query";

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <Flex justify="space-between" align="center" py={12}>
    <Text size="md" c="#555454ff" fw={400}>
      {label}
    </Text>
    <Text size="md" fw={600} c="#000">
      {value}
    </Text>
  </Flex>
);

const menuItems = [
  { 
    icon: <FaBuilding size={24} />, 
    title: "Company Introduction",
    path: "/company"
  },
  { 
    icon: <FaIdCard size={24} />, 
    title: "Identity authentication",
    path: "/identity"
  },
  { 
    icon: <FaFileAlt size={24} />, 
    title: "Financial Records",
    path: "/financial-records"
  },
  { 
    icon: <FaUsers size={24} />, 
    title: "Team building application",
    path: "/team"
  },
  { 
    icon: <FaShieldAlt size={24} />, 
    title: "Account Security",
    path: "/security"
  },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, isLoggedIn } = useSelector((state: RootState) => state.auth);
  
  const { data, isLoading, isError } = useVerifyUserQuery();

  useEffect(() => {
    if (data?.status === "success" && data.data?.user) {
      dispatch(login(data.data.user));
    } else if (isError) {
      navigate("/login");
    }
  }, [data, isError, dispatch, navigate]);

  const formatCurrency = (value: number): string => {
    return value.toFixed(2);
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleRecharge = () => {
    navigate("/recharge");
  };

  const handleWithdrawal = () => {
    navigate("/withdrawal");
  };

  if (isLoading || isLoggedIn === "loading") {
    return (
      <Center h="100vh">
        <Loader size="lg" color="#d4a017" />
      </Center>
    );
  }

  if (isError || !userData) {
    return (
      <Center h="100vh">
        <Box ta="center">
          <Text size="lg" fw={600} c="red">
            Failed to load profile
          </Text>
          <Button
            mt="md"
            onClick={() => navigate("/login")}
            style={{
              background: "linear-gradient(135deg, #f9d77e 0%, #f0b944 100%)",
              color: "#7e6227ff",
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Center>
    );
  }

  return (
    <>
      <Box
        style={{
          background: `url(${IMAGES.Home_Page}) center/cover no-repeat`,
          position: "relative",
          minHeight: 120,
        }}
      >
        <Box p={20}>
          <Flex align="center" gap="16px">
            {userData.picture ? (
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#d4a017",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #fff",
                  overflow: "hidden",
                }}
              >
                <img
                  src={userData.picture}
                  alt={userData.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            ) : (
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#d4a017",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#fff",
                  border: "3px solid #fff",
                }}
              >
                {getInitials(userData.name)}
              </Box>
            )}

            <Flex direction="column">
              <Text size="sm" c="#fff" fw={500}>
                {userData.phone}
              </Text>
              <Box
                mt={10}
                px={10}
                style={{
                  background: "#d4a017",
                  borderRadius: 4,
                  color: "black",
                  fontSize: 14,
                  fontWeight: 600,
                  alignSelf: "flex-start",
                }}
              >
                {userData.username}
              </Box>
              {userData.levelName && (
                <Box
                  mt={6}
                  px={8}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: 4,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                    alignSelf: "flex-start",
                  }}
                >
                  {userData.levelName} • Level {userData.userLevel}
                </Box>
              )}
            </Flex>
          </Flex>
        </Box>
      </Box>

      <Box px="md" mt={-20} bg="#fff">
        <Box
          p="lg"
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: "100",
          }}
        >
          <StatItem
            label="Today's mission income"
            value={formatCurrency(userData.todayIncome)}
          />
          <Divider />
          <StatItem
            label="This month's mission income"
            value={formatCurrency(userData.monthlyIncome)}
          />
          <Divider />
          <StatItem
            label="Total revenue"
            value={formatCurrency(userData.totalRevenue)}
          />
          <Divider />
          <StatItem
            label="Total withdrawals"
            value={formatCurrency(userData.totalWithdrawals)}
          />
          <Divider />
          <StatItem
            label="Main Wallet"
            value={formatCurrency(userData.mainWallet)}
          />
          <Divider />
          <StatItem
            label="Commission Wallet"
            value={formatCurrency(userData.commissionWallet)}
          />
          <Divider />
          <StatItem
            label="Profit"
            value={formatCurrency(userData.totalProfit)}
          />

          <Flex gap="md" mt="lg">
            <Button
              flex={1}
              onClick={handleRecharge}
              style={{
                background: "linear-gradient(135deg, #f9d77e 0%, #f0b944 100%)",
                color: "#7e6227ff",
                fontWeight: 600,
                borderRadius: "100px",
                border: "none",
              }}
            >
              Recharge
            </Button>
            <Button
              flex={1}
              onClick={handleWithdrawal}
              style={{
                background: "linear-gradient(135deg, #f9d77e 0%, #f0b944 100%)",
                color: "#7e6227ff",
                fontWeight: 600,
                borderRadius: "100px",
                border: "none",
              }}
            >
              Withdrawal
            </Button>
          </Flex>
        </Box>


        {/* Menu Items */}
        <Box mt="lg" mb="sm">
          {menuItems.map((item,index) => (
            <Box key={item.title}>
              <Flex
                align="center"
                justify="space-between"
                py={16}
                onClick={() => handleMenuClick(item.path)}
                style={{ cursor: "pointer" }}
              >
                <Flex align="center" gap="md">
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#d4a017",
                      background: "#f9d77e20",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Text size="md" fw={500} c="#000">
                    {item.title}
                  </Text>
                </Flex>
                <Text size="xl" c="#999">
                  ›
                </Text>
              </Flex>
              {
                index != menuItems.length -1 && <Divider />
              }
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default Profile;