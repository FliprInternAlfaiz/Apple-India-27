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
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/reducer/authSlice";
import classes from "./Signup.module.scss";
import { ROUTES } from "../../enum/routes";
import { useVerifyUserQuery } from "../../hooks/query/useGetVerifyUser.query";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");

  const { mutate: sendOtp, isPending: sendingOtp } = useSignupMutation();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyOtpMutation();
    const { refetch } = useVerifyUserQuery(); 

  const validateForm = () => {
    const { name, phone, password } = formData;
    if (!name || !phone || !password) {
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
    return true;
  };

  const handleSendOtp = () => {
    if (!validateForm()) return;
    sendOtp(formData, {
      onSuccess: (res: any) => {
        if (res?.status === "success") {
          showNotification({
            title: "OTP Sent",
            message: `OTP sent to ${formData.phone}`,
            color: "green",
          });
          setStep("otp");
        } else {
          showNotification({
            title: res?.title || "Failed to Send OTP",
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
    });
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      showNotification({
        title: "Validation Error",
        message: "OTP is required.",
        color: "red",
      });
      return;
    }

    verifyOtp(
      { ...formData, otp },
      {
        onSuccess: (res: any) => {
          if (res?.status === "success") {
            dispatch(login(res.data));
            showNotification({
              title: "Signup Successful",
              message: "Account created successfully.",
              color: "green",
            });
             setTimeout(async () => {
              await refetch(); 
              navigate(ROUTES.HOMEPAGE);
            }, 400);
          } else {
            showNotification({
              title: res?.title || "Verification Failed",
              message: res?.message || "Something went wrong.",
              color: "red",
            });
          }
        },
        onError: (err: any) =>
          showNotification({
            title: "Error",
            message: err?.message || "OTP verification failed.",
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
            {["name", "phone"].map((field) => (
              <TextInput
                key={field}
                label={field[0].toUpperCase() + field.slice(1)}
                placeholder={`Enter your ${field}`}
                mb="sm"
                value={(formData as any)[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.currentTarget.value })
                }
                classNames={{ label: classes.label, input: classes.input }}
              />
            ))}
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              mb="lg"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.currentTarget.value })
              }
              classNames={{ label: classes.label, input: classes.input }}
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
              loading={sendingOtp}
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
              loading={verifyingOtp}
              onClick={handleVerifyOtp}
              mt="md"
            >
              Verify OTP & Sign Up
            </Button>
          </>
        )}
      </Paper>
    </Flex>
  );
};

export default Signup;
