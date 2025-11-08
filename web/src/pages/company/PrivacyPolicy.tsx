import React from "react";
import { Flex, Text, Box, ScrollArea } from "@mantine/core";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
const PrivacyPolicy: React.FC = () => {
  return (
    <Flex direction="column" style={{ height: "100vh", backgroundColor: "#ffffff" }}>
      <CommonHeader heading="Privacy Policy" />

      <ScrollArea style={{ flex: 1, padding: 20 }}>
        <Box>
          <Text c="#8FABD4" fw={700} size="xl" mb="md">
            Privacy Policy
          </Text>

          <Text c="#333333" size="sm" lh={1.7} mb="md">
            Apple uses personal data to power our services, to process your transactions,
            to communicate with you, for security and fraud prevention, and to comply with law.
            We may also use personal data for other purposes with your consent. Apple uses your
            personal data only when we have a valid legal basis to do so.
          </Text>

          <Text c="#333333" size="sm" lh={1.7} mt="md">
            <b style={{ color: "#8FABD4" }}>Data Collection:</b> We collect personal data that you provide directly to us,
            such as account information, payment details, and communication preferences.
          </Text>

          <Text c="#333333" size="sm" lh={1.7} mt="md">
            <b style={{ color: "#8FABD4" }}>Data Usage:</b> Personal data is used to provide and improve our services,
            personalize your experience, and ensure security and compliance with applicable laws.
          </Text>

          <Text c="#333333" size="sm" lh={1.7} mt="md">
            <b style={{ color: "#8FABD4" }}>Data Sharing:</b> We may share personal data with our affiliates,
            service providers, and as required by law. We do not sell your personal information.
          </Text>

          <Text c="#333333" size="sm" lh={1.7} mt="md">
            <b style={{ color: "#8FABD4" }}>Your Rights:</b> You have rights to access, correct, or delete your personal data,
            and to restrict or object to certain processing activities in accordance with applicable laws.
          </Text>
        </Box>
      </ScrollArea>
    </Flex>
  );
};

export default PrivacyPolicy;
