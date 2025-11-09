import {
  Button,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import classes from "./index.module.scss";
import { INITIAL_VALUES } from "../../../forms/intial-values";
import { VALIDATIONS } from "../../../forms/validations";
import { useLoginAdminMutation } from "../../../hooks/mutations/useLoginMutation";
import { showNotification } from "@mantine/notifications";
import { ROUTES } from "../../../enum/routes";
import { FaApple } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../../../assets/colors";
const Login = () => {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: INITIAL_VALUES.LOGIN,
    validate: yupResolver(VALIDATIONS.LOGIN),
  });

  const { mutate, isPending } = useLoginAdminMutation();

  const handleSubmit = (values: typeof form.values) => {
    mutate(
      { email: values.username, password: values.password },
      {
        onSuccess: (response: TServerResponse) => {
          if (response?.status === "success") {
            showNotification({
              title: "Login Successful",
              message: "Welcome back! You have successfully logged in.",
              color: "green",
            });
            navigate(ROUTES.DASHBOARD);
          } else {
            showNotification({
              title: "Login Failed",
              message:
                response?.data?.message ||
                "Unable to log in. Please try again.",
              color: "red",
            });
          }
        },
        onError: (error) => {
          showNotification({
            title: "Login Failed",
            message:
              error?.message ?? "Something went wrong. Please try again.",
            color: "red",
          });
        },
      }
    );
  };

  return (
    <div className={classes.mainContainer}>
      <div className={classes.card}>
        <div className={classes.formContainer}>
          <div className={classes.imgContainer}>
            <FaApple size="45px" color={COLORS.primaryDark}/>
          </div>
          <Text c={COLORS.primaryDark} size="16px" fw={600}>
            Welcome Back To Apple India Job 24X7
          </Text>
          <Text c={COLORS.primaryDark} size="14px" fw={500}>
            Login to Control Panel
          </Text>
          <form
            onSubmit={form.onSubmit(handleSubmit)}
            className={classes.loginForm}
          >
            <TextInput
              label="Enter Your Email"
              placeholder="Enter Email"
              {...form.getInputProps("username")}
              error={form.getInputProps("username").error}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <PasswordInput
              label="Enter Your Password"
              placeholder="Enter password"
              {...form.getInputProps("password")}
              error={form.getInputProps("password").error}
              classNames={{ label: classes.label, input: classes.input }}
            />
            <Button
              size="md"
              type="submit"
              loading={isPending}
              disabled={isPending}
              className={classes.button}
              bg={COLORS.primary}
            >
              <Text>Submit</Text>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
