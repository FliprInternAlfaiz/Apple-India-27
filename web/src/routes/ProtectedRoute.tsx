import { useEffect } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useVerifyUserQuery } from "../hooks/query/useGetVerifyUser.query";
import { ROUTES } from "../enum/routes";
import { Center, Loader } from "@mantine/core";
import classes from "./index.module.scss"; 

const ProtectedRoute = () => {
  const { pathname } = useLocation();
  const { data, isLoading, isError } = useVerifyUserQuery();

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

  if (isError || !data || data.status !== "success") {
    return <Navigate to={ROUTES.LOGIN} replace/>;
  }

  return ( <div className={classes.root}> <Outlet /> </div> );
};

export default ProtectedRoute;
