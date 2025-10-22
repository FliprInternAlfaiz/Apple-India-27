import React, { useState } from "react";
import { Box, TextInput, PasswordInput, Button, Text, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    navigate("/"); 
  };

  return (
    <Flex justify="center" align="center" style={{ height: "100vh", background: "#f5f5f5" }}>
      <Box p="xl" style={{ background: "white", borderRadius: 12, width: 360 }}>
        <Text fw={700} ta="center" size="xl" mb="lg">
          Sign Up
        </Text>
        <TextInput
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          mb="sm"
        />
        <TextInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          mb="sm"
        />
        <TextInput
          label="Phone Number"
          placeholder="Enter your phone"
          value={phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
          mb="sm"
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          mb="md"
        />
        <Button fullWidth onClick={handleSubmit}>
          Sign Up
        </Button>
        <Text ta="center" mt="sm" size="sm" style={{ cursor: "pointer" }} onClick={() => navigate("/login")}>
          Already have an account? Login
        </Text>
      </Box>
    </Flex>
  );
};

export default Signup;
