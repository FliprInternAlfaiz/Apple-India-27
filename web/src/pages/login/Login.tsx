import React, { useState } from "react";
import { Box, TextInput, PasswordInput, Button, Text, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    await login(phone, password);
    navigate("/");
  };

  return (
    <Flex justify="center" align="center" style={{ height: "100vh", background: "#f5f5f5" }}>
      <Box p="xl" style={{ background: "white", borderRadius: 12, width: 360 }}>
        <Text fw={700} ta="center" size="xl" mb="lg">
          Login
        </Text>
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
          Login
        </Button>
        <Text ta="center" mt="sm" size="sm" style={{ cursor: "pointer" }} onClick={() => navigate("/signup")}>
          Don't have an account? Sign up
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
