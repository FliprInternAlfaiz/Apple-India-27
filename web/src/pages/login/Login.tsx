import React, { useState } from "react";
import { Box, TextInput, PasswordInput, Button, Text, Flex } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useLoginMutation } from "../../hooks/mutations/useLogin.mutation";
import { ROUTES } from "../../enum/routes";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useLoginMutation();

  const handleSubmit = () => {
    if (!phone || !password) {
      showNotification({
        title: "Validation Error",
        message: "Phone and password are required.",
        color: "red",
      });
      return;
    }

    mutate(
      { phone, password },
      {
        onSuccess: (res: any) => {
          if (res?.status === "success") {
            showNotification({
              title: "Login Successful",
              message: "Welcome back!",
              color: "green",
            });
            navigate(ROUTES.HOMEPAGE);
          } else {
            showNotification({
              title: "Login Failed",
              message: res?.message || "Invalid credentials",
              color: "red",
            });
          }
        },
        onError: (err: any) => {
          showNotification({
            title: "Login Failed",
            message: err?.message || "Something went wrong",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <Flex justify="center" align="center" style={{ height: "100vh", background: "#f5f5f5" }}>
      <Box p="xl" style={{ background: "white", borderRadius: 12, width: 400 }}>
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
        <Button fullWidth loading={isPending} onClick={handleSubmit}>
          Login
        </Button>
        <Text
          ta="center"
          mt="sm"
          size="sm"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/signup")}
        >
          Don't have an account? Sign up
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
