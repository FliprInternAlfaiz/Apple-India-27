// src/screens/Signup.tsx
import React, { useEffect, useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Flex,
  Paper,
  Title,
  Alert,
} from "@mantine/core";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useSignupMutation } from "../../hooks/mutations/useSignup.mutation";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/reducer/authSlice";
import classes from "./Signup.module.scss";
import { ROUTES } from "../../enum/routes";
import { useVerifyUserQuery } from "../../hooks/query/useGetVerifyUser.query";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const { mutate: signup, isPending: signingUp } = useSignupMutation();
  const { refetch } = useVerifyUserQuery();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const { name, phone, password, confirmPassword } = formData;
    
    if (!name || !phone || !password || !confirmPassword) {
      showNotification({
        title: "Validation Error",
        message: "All fields are required.",
        color: "red",
      });
      return false;
    }
    
    if (!/^\d{10}$/.test(phone)) {
      showNotification({
        title: "Invalid Phone",
        message: "Please enter a valid 10-digit phone number.",
        color: "red",
      });
      return false;
    }
    
    if (password.length < 6) {
      showNotification({
        title: "Weak Password",
        message: "Password must be at least 6 characters long.",
        color: "red",
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      showNotification({
        title: "Password Mismatch",
        message: "Passwords do not match.",
        color: "red",
      });
      return false;
    }
    
    return true;
  };

  const handleSignup = () => {
    if (!validateForm()) return;

    const { name, phone, password, referralCode } = formData;

    signup(
      { 
        name, 
        phone, 
        password,
        referralCode: referralCode.trim() || undefined
      },
      {
        onSuccess: async (res: any) => {

          if (res?.status === "success") {
            dispatch(login(res.data));
            showNotification({
              title: res?.data?.title || "Signup Successful",
              message: res?.data?.message || "Account created successfully.",
              color: "green",
            });

            setTimeout(async () => {
              await refetch();
              navigate(ROUTES.HOMEPAGE);
            }, 600);
          } else {
            showNotification({
              title: res?.data?.title || "Signup Failed",
              message: res?.data?.message || "Something went wrong.",
              color: "red",
            });
          }
        },
        onError: (err: any) => {
          showNotification({
            title: err?.response?.data?.title || "Error",
            message:
              err?.response?.data?.message ||
              err?.message ||
              "Failed to create account.",
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
          Sign Up
        </Title>

        <TextInput
          label="Name"
          placeholder="Enter your name"
          mb="sm"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.currentTarget.value })
          }
          classNames={{ label: classes.label, input: classes.input }}
          required
        />

        <TextInput
          label="Phone"
          placeholder="Enter your phone number"
          mb="sm"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.currentTarget.value })
          }
          classNames={{ label: classes.label, input: classes.input }}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          mb="sm"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.currentTarget.value })
          }
          classNames={{ label: classes.label, input: classes.input }}
          required
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          mb="sm"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.currentTarget.value })
          }
          classNames={{ label: classes.label, input: classes.input }}
          required
        />

        <Text
          my="md"
          size="sm"
          className={classes.link}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </Text>

        <Button
          fullWidth
          color="yellow"
          loading={signingUp}
          onClick={handleSignup}
        >
          Sign Up
        </Button>
      </Paper>
    </Flex>
  );
};

export default Signup;