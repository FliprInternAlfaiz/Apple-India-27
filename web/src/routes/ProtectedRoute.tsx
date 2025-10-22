import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import classes from "./index.module.scss";
import TheLayout from "../layout/TheLayout";

const ProtectedRoute = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className={classes.root}>
      <TheLayout />
    </div>
  );
};

export default ProtectedRoute;
