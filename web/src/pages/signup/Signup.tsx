import React, { useState } from "react";
import {
  Box,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Flex,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useSignupMutation } from "../../hooks/mutations/useSignup.mutation";
import { useVerifyOtpMutation } from "../../hooks/mutations/useVerifyOtp.mutation";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const { mutate: sendOtp, isPending: isSendOtpPending } = useSignupMutation();
  const { mutate: verifyOtp, isPending: isVerifyOtpPending } =
    useVerifyOtpMutation();

  const handleSendOtp = () => {
    if (!name || !email || !phone || !password) {
      showNotification({
        title: "Validation Error",
        message: "All fields are required",
        color: "red",
      });
      return;
    }

    sendOtp(
      { name, email, phone, password },
      {
        onSuccess: (res: any) => {
          if (res?.status === "success") {
            showNotification({
              title: "OTP Sent",
              message: `OTP sent to ${phone}`,
              color: "green",
            });
            setStep("otp");
          } else {
            showNotification({
              title: "Failed to send OTP",
              message: res?.message || "Something went wrong",
              color: "red",
            });
          }
        },
        onError: (error: any) => {
          showNotification({
            title: "Error",
            message: error?.message || "Failed to send OTP",
            color: "red",
          });
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      showNotification({
        title: "Validation Error",
        message: "OTP is required",
        color: "red",
      });
      return;
    }

    verifyOtp(
      { email, name, password, phone, otp },
      {
        onSuccess: (res: any) => {
          if (res?.status === "success") {
            showNotification({
              title: "Signup Successful",
              message: "Account created successfully",
              color: "green",
            });
            navigate("/login");
          } else {
            showNotification({
              title: "OTP Verification Failed",
              message: res?.message || "Invalid OTP",
              color: "red",
            });
          }
        },
        onError: (error: any) => {
          showNotification({
            title: "Error",
            message: error?.message || "OTP verification failed",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <Flex
      justify="center"
      align="center"
      style={{ height: "100vh", background: "#f5f5f5" }}
    >
      <Box p="xl" style={{ background: "white", borderRadius: 12, width: 400 }}>
        <Text fw={700} ta="center" size="xl" mb="lg">
          Sign Up
        </Text>

        {step === "form" ? (
          <>
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
            <Button
              fullWidth
              loading={isSendOtpPending}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="OTP"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.currentTarget.value)}
              mb="sm"
            />
            <Button
              fullWidth
              loading={isVerifyOtpPending}
              onClick={handleVerifyOtp}
            >
              Verify OTP & Sign Up
            </Button>
          </>
        )}

        <Text
          ta="center"
          mt="sm"
          size="sm"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </Text>
      </Box>
    </Flex>
  );
};

export default Signup;
