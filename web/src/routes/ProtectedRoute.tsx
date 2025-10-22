import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import classes from "./index.module.scss";
import TheLayout from "../layout/TheLayout";
import { ROUTES } from "../enum/routes";
import { useVerifyUserQuery } from "../hooks/query/useGetVerifyUser.query";
import { Center, Loader } from "@mantine/core";

const ProtectedRoute = () => {
  const { pathname } = useLocation();
  const { data, isLoading, isError } = useVerifyUserQuery();
  console.log(data);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (isError || !data || data.status !== "success") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className={classes.root}>
      <TheLayout />
    </div>
  );
};

export default ProtectedRoute;
