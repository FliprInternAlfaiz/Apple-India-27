import React from "react";
import { Box, Text, Flex, Button, Divider } from "@mantine/core";
import {
  FaBuilding,
  FaIdCard,
  FaFileAlt,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { IMAGES } from "../../assets";

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
  { icon: <FaBuilding size={24} />, title: "Company Introduction" },
  { icon: <FaIdCard size={24} />, title: "Identity authentication" },
  { icon: <FaFileAlt size={24} />, title: "Financial Records" },
  { icon: <FaUsers size={24} />, title: "Team building application" },
  { icon: <FaShieldAlt size={24} />, title: "Account Security" },
];

const Profile: React.FC = () => {
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
    <Box
      style={{
        width: 60,
        height: 60,
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
      LG
    </Box>

    <Flex direction="column">
      <Text size="sm" c="#fff" fw={500}>
        +91 98765 43210
      </Text>
      <Box
        mt={10}
        px={16}
        py={6}
        style={{
          background: "#d4a017",
          borderRadius: 12,
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        LG3
      </Box>
    </Flex>
  </Flex>
</Box>

      </Box>

      <Box px="md" mt={-20}>
        <Box
          p="lg"
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <StatItem label="Today's mission income" value="12625.30" />
          <Divider />
          <StatItem label="This month's mission income" value="46506.21" />
          <Divider />
          <StatItem label="Total revenue" value="90303.29" />
          <Divider />
          <StatItem label="Total withdrawals" value="0.00" />
          <Divider />
          <StatItem label="Main Wallet" value="0.63" />
          <Divider />
          <StatItem label="Commission Wallet" value="0.66" />
          <Divider />
          <StatItem label="Profit" value="90303.29" />

          <Flex gap="md" mt="lg">
            <Button
              flex={1}
              style={{
                background: "linear-gradient(135deg, #f9d77e 0%, #f0b944 100%)",
                color: "#7e6227ff",
                fontWeight: 600,
                borderRadius: "100px",
              }}
            >
              Recharge
            </Button>
            <Button
              flex={1}
              style={{
                background: "linear-gradient(135deg, #f9d77e 0%, #f0b944 100%)",
                color: "#7e6227ff",
                fontWeight: 600,
                borderRadius: "100px",
              }}
            >
              Withdrawal
            </Button>
          </Flex>
        </Box>

        {/* Menu Items */}
        <Box mt="lg">
          {menuItems.map((item, index) => (
            <Box key={item.title}>
              <Flex
                align="center"
                justify="space-between"
                py={8}
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
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default Profile;
