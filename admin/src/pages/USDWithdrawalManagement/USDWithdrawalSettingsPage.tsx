import { Flex} from "@mantine/core";
import WithdrawalSettings from "./WithdrawalSettings";
import classes from "./index.module.scss";

const USDWithdrawalSettingsPage = () => {
  return (
    <Flex direction="column" gap="md" className={classes.container}>

      <WithdrawalSettings />
    </Flex>
  );
};

export default USDWithdrawalSettingsPage;
