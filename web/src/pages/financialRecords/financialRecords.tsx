import React, { useState } from "react";
import {
  Container,
  Tabs,
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Center,
  Box,
} from "@mantine/core";
import { FaWallet, FaMoneyBillWave } from "react-icons/fa";
import {
  useWalletInfoQuery,
  useWithdrawalHistoryQuery,
} from "../../hooks/query/useWithdrawal.query";
import { useRechargeHistoryQuery } from "../../hooks/query/useRecharge.query";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import classes from "./FinancialRecords.module.scss";

const FinancialRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"recharge" | "withdrawal">(
    "recharge"
  );

  const {
    data: walletData,
    isLoading: walletLoading,
    isError: walletError,
  } = useWalletInfoQuery();
  const {
    data: rechargeData,
    isLoading: rechargeLoading,
    isError: rechargeError,
  } = useRechargeHistoryQuery({ page: 1, limit: 10 });
  const {
    data: withdrawalData,
    isLoading: withdrawalLoading,
    isError: withdrawalError,
  } = useWithdrawalHistoryQuery({ page: 1, limit: 10 });

  const formatCurrency = (amt: number | undefined) =>
    (amt || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      completed: "green",
      pending: "yellow",
      processing: "blue",
      rejected: "red",
      failed: "red",
    };
    return map[status.toLowerCase()] || "gray";
  };

  const renderStatusBadge = (status: string) => (
    <Badge
      color={getStatusColor(status)}
      size="sm"
      radius="sm"
      variant="filled"
    >
      {status.toUpperCase()}
    </Badge>
  );

  const renderEmpty = (msg: string) => (
    <Center py={60}>
      <Text c="dimmed" size="sm" fw={500}>
        {msg}
      </Text>
    </Center>
  );

  const renderLoading = () => (
    <Center py={60}>
      <Loader color="yellow" size="lg" variant="dots" />
    </Center>
  );

  return (
    <div className={classes.financialRecords}>
      <CommonHeader heading="My Wallet History" />

      <Container size="sm" mt="md">
        <Card radius="md" p="lg" shadow="sm" withBorder mb="lg">
          {walletError ? (
            <Center>
              <Text c="red">Failed to load wallet info</Text>
            </Center>
          ) : (
            <Group grow>
              <Box>
                <FaWallet size={24} color="#1a1a3e" />
                <Text fw={500} mt={4}>
                  Recharge
                </Text>
                <Text fw={700} fz="xl" mt={2}>
                  {walletLoading
                    ? "..."
                    : `₹${formatCurrency(walletData?.mainWallet)}`}
                </Text>
              </Box>
              <Box>
                <FaMoneyBillWave size={24} color="#1a1a3e" />
                <Text fw={500} mt={4}>
                  Withdrawal
                </Text>
                <Text fw={700} fz="xl" mt={2}>
                  {walletLoading
                    ? "..."
                    : `₹${formatCurrency(walletData?.commissionWallet)}`}
                </Text>
              </Box>
            </Group>
          )}
        </Card>

        <Tabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as any)}
          variant="pills"
          radius="md"
          defaultValue="recharge"
          color="yellow"
          classNames={{
            tab: classes.tabItem,
            list: classes.tabsList,
          }}
        >
          <Tabs.List grow>
            <Tabs.Tab value="recharge" >Recharge Record</Tabs.Tab>
            <Tabs.Tab value="withdrawal">Withdrawal Record</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="recharge" pt="md">
            {rechargeLoading ? (
              renderLoading()
            ) : rechargeError ? (
              renderEmpty("Failed to load recharge history")
            ) : !rechargeData?.recharges?.length ? (
              renderEmpty("No recharge history found")
            ) : (
              <Stack>
                {rechargeData.recharges.map((r: any) => (
                  <Card key={r._id} shadow="xs" p="sm" radius="md" withBorder>
                    <Group>
                      <Stack>
                        {renderStatusBadge(r.status)}
                        <Text size="xs" fw={500}>
                          {r.orderId}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(r.createdAt)}
                        </Text>
                      </Stack>
                      <Text fw={700} fz="lg">
                        ₹{formatCurrency(r.amount)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="withdrawal" pt="md">
            {withdrawalLoading ? (
              renderLoading()
            ) : withdrawalError ? (
              renderEmpty("Failed to load withdrawal history")
            ) : !withdrawalData?.withdrawals?.length ? (
              renderEmpty("No withdrawal history found")
            ) : (
              <Stack>
                {withdrawalData.withdrawals.map((w: any) => (
                  <Card key={w._id} shadow="xs" p="sm" radius="md" withBorder>
                    <Group>
                      <Stack>
                        {renderStatusBadge(w.status)}
                        <Text size="xs" fw={500}>
                          {w.bankName} ({w.ifscCode})
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(w.createdAt)}
                        </Text>
                      </Stack>
                      <Text fw={700} fz="lg">
                        ₹{formatCurrency(w.amount)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Container>
    </div>
  );
};

export default FinancialRecords;
