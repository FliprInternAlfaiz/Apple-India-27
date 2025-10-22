import React from "react";
import { Box, SimpleGrid, Text, Flex, Image } from "@mantine/core";
import {
  FaBuilding,
  FaGift,
  FaNewspaper,
  FaCrown,
  FaEnvelope,
  FaUsers,
  FaTicketAlt,
  FaMoneyBillWave,
  FaUniversity,
  FaIdCard,
} from "react-icons/fa";
import { IMAGES } from "../../assets";
import { HEADER_HEIGHT } from "../../ui/Header/Header";

const menuItems = [
  { icon: <FaBuilding />, title: "Company Introduction" },
  { icon: <FaGift />, title: "Company Activities" },
  { icon: <FaNewspaper />, title: "Conference News" },
  { icon: <FaCrown />, title: "Member Benefits" },
  { icon: <FaEnvelope />, title: "Management Positions" },
  { icon: <FaUsers />, title: "Team Expansion" },
  { icon: <FaTicketAlt />, title: "Lucky Draw" },
  { icon: <FaMoneyBillWave />, title: "Financial Management Fund" },
  { icon: <FaUniversity />, title: "Recharge" },
  { icon: <FaIdCard />, title: "Identity Authentication" },
];

const ads = [IMAGES.ad1, IMAGES.ad2];

const Home: React.FC = () => {
  return (
    <>
      <Box
        style={{
          background: `url(${IMAGES.Home_Page}) center/cover no-repeat`,
          position: "relative",
        }}
      >
        <Box pt={HEADER_HEIGHT + 20} pb={30}>
          <Flex justify="center" align="flex-start" direction="column" ml={20}>
            <Text c="white" fw={500} size="20px">
              Welcome to Apple
            </Text>
            <Text mt="sm" c="white" fw={500} size="18px">
              Start your work journey here
            </Text>
          </Flex>
        </Box>
      </Box>

      <Box p="md">
        <SimpleGrid cols={3} spacing="sm" style={{ alignItems: "stretch" }}>
          {menuItems.map((item) => (
            <Flex
              key={item.title}
              direction="column"
              align="center"
              justify="flex-start"
              style={{
                padding: "12px",
                borderRadius: "10px",
                color: "#000",
                minHeight: 150,
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "2px solid #d4a017",
                  color: "#d4a017",
                  fontSize: 30,
                  background: "rgba(255, 255, 255, 0.1)",
                  marginBottom: 8,
                }}
              >
                {item.icon}
              </Box>

              <Text ta="center" size="sm" mt="xs" fw={500}>
                {item.title}
              </Text>
            </Flex>
          ))}
        </SimpleGrid>

        <Box mt="lg" p="sm" style={{ borderRadius: 8, background: "#fff" }}>
          <Text fw={700} ta="center" bg="black" c="white" pt={10} pb={10}>
            Advertisement Display Area
          </Text>
          <Flex direction="column">
            {ads.map((ad, idx) => (
              <Image
                key={idx + 1}
                src={ad}
                alt={`Ad ${idx + 1}`}
                mb={10}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ))}
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Home;
