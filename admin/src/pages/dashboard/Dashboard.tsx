import {
  Title,
} from "@mantine/core";
import classes from "./index.module.scss";

const Dashboard = () => {
  return (
    <div className={classes.container}>
      <Title order={2} className={classes.pageTitle}>
        Dashboard Overview
      </Title>
    </div>
  );
};

export default Dashboard;
