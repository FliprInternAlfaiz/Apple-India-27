import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Flex,
  Paper,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useLoginMutation } from "../../hooks/mutations/useLogin.mutation";
import { ROUTES } from "../../enum/routes";
import classes from "./Login.module.scss";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/reducer/authSlice";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending } = useLoginMutation();
  const dispatch = useAppDispatch();

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
           dispatch(login(res.data));
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
    <Flex justify="center" align="center" className={classes.container}>
      <Paper radius="md" p="xl" shadow="xl" className={classes.paper}>
        <Title order={2} mb="lg" className={classes.title}>
          Login
        </Title>
        <TextInput
          label="Phone Number"
          type="number"
          placeholder="Eg., 7804064484"
          value={phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
           classNames={{ label: classes.label, input: classes.input }}
          mb="sm"
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
           classNames={{ label: classes.label, input: classes.input }}
          mb="lg"
        />
        <Button
          fullWidth
          loading={isPending}
          onClick={handleSubmit}
          color="yellow"
        >
          Login
        </Button>
        <Text
          mt="md"
          size="sm"
          className={classes.link}
          onClick={() => navigate("/signup")}
        >
          Don't have an account? Sign up
        </Text>
      </Paper>
    </Flex>
  );
};

export default Login;
