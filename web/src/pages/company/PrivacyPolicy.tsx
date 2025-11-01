import React from "react";
import { Flex, Text, Box, ScrollArea } from "@mantine/core";
import CommonHeader from "../../components/CommonHeader/CommonHeader"; // update path if needed

const BRAND_COLOR = "#2d1b4e";

const PrivacyPolicy: React.FC = () => {
  return (
    <Flex direction="column" style={{ height: "100vh", backgroundColor: "#f9f9f9" }}>
      <CommonHeader heading="Privacy Policy" />

      <ScrollArea style={{ flex: 1, padding: 20 }}>
        <Box>
          <Text color={BRAND_COLOR} fw={600} size="md" mb="sm">
            Privacy Policy
          </Text>

          <Text c="dimmed" size="sm" lh={1.6}>
            Apple uses personal data to power our services, to process your transactions,
            to communicate with you, for security and fraud prevention, and to comply with law.
            We may also use personal data for other purposes with your consent. Apple uses your
            personal data only when we have a valid legal basis to do so.
          </Text>
        </Box>
      </ScrollArea>
    </Flex>
  );
};

export default PrivacyPolicy;
