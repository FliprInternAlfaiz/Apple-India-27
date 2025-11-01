import React from "react";
import { Flex, Text, ActionIcon } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaLongArrowAltLeft } from "react-icons/fa";

interface CommonHeaderProps {
  heading: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ heading }) => {
  const navigate = useNavigate();

  return (
    <Flex
      align="center"
      justify="space-between"
      p="md"
      style={{
        backgroundColor: "#2d1b4e",
        color: "white",
        borderBottom: "2px solid #eee",
      }}
    >
      <div
       style={{cursor:"pointer"}}
        onClick={() => navigate(-1)}
      >
        <FaLongArrowAltLeft size={20} />
      </div>

      <Text size="lg" fw={600} style={{ flex: 1, textAlign: "center" }}>
        {heading}
      </Text>

      {/* Placeholder to balance layout */}
      <div style={{ width: 24 }} />
    </Flex>
  );
};

export default CommonHeader;
