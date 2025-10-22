import { useEffect } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useVerifyUserQuery } from "../hooks/query/useGetVerifyUser.query";
import { ROUTES } from "../enum/routes";
import { Center, Loader } from "@mantine/core";
import classes from "./index.module.scss";

const AuthRoute = () => {
  const { pathname } = useLocation();
  const { data, isLoading } = useVerifyUserQuery();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  if (isLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  if (data?.status === "success") {
    return <Navigate to={ROUTES.HOMEPAGE} replace />;
  }

  return (
    <div className={classes.root}>
      {" "}
      <Outlet />{" "}
    </div>
  );
};

export default AuthRoute;
