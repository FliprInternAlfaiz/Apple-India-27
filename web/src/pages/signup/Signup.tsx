import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Flex,
  Paper,
  Title,
  PinInput,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { useSignupMutation } from "../../hooks/mutations/useSignup.mutation";
import { useVerifyOtpMutation } from "../../hooks/mutations/useVerifyOtp.mutation";
import classes from "./Signup.module.scss";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/reducer/authSlice";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const dispatch = useAppDispatch();
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
        onError: (err: any) =>
          showNotification({
            title: "Error",
            message: err?.message || "Failed to send OTP",
            color: "red",
          }),
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
                      dispatch(login(res.data));
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
        onError: (err: any) =>
          showNotification({
            title: "Error",
            message: err?.message || "OTP verification failed",
            color: "red",
          }),
      }
    );
  };

  return (
    <Flex justify="center" align="center" className={classes.container}>
      <Paper radius="md" p="xl" shadow="xl" className={classes.paper}>
        <Title order={2} mb="lg" className={classes.title}>
          Sign Up
        </Title>

        {step === "form" ? (
          <>
            <TextInput
              label="Name"
              placeholder="Enter your name"
              mb="sm"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <TextInput
              label="Email"
              placeholder="Enter your email"
              mb="sm"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter your phone"
              mb="sm"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              mb="lg"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <Button
              fullWidth
              color="yellow"
              loading={isSendOtpPending}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <PinInput
              autoFocus
              placeholder=""
              type="number"
              length={6}
              value={otp}
              onChange={setOtp}
              classNames={{
                input: classes.pininput,
                root: classes.pinroot,
              }}
            />
            <Button
              fullWidth
              color="yellow"
              loading={isVerifyOtpPending}
              onClick={handleVerifyOtp}
              mt="md"
            >
              Verify OTP & Sign Up
            </Button>
          </>
        )}

        <Text
          mt="md"
          size="sm"
          className={classes.link}
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </Text>
      </Paper>
    </Flex>
  );
};

export default Signup;
