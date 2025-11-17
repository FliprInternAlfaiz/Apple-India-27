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
  Avatar,
  Paper,
  Divider,
} from "@mantine/core";
import { FaWallet, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import {
  useWalletInfoQuery,
  useWithdrawalHistoryQuery,
} from "../../hooks/query/useWithdrawal.query";
import { useRechargeHistoryQuery } from "../../hooks/query/useRecharge.query";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import classes from "./FinancialRecords.module.scss";
import { useTeamReferralHistoryQuery } from "../../hooks/query/team.query";

const FinancialRecords: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "recharge" | "withdrawal" | "referral"
  >("recharge");

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

  const {
    data: referralData,
    isLoading: referralLoading,
    isError: referralError,
  } = useTeamReferralHistoryQuery({ page: 1, limit: 10 });

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

  const getLevelColor = (level: string) => {
    const map: Record<string, string> = {
      A: "blue",
      B: "violet",
      C: "grape",
    };
    return map[level] || "gray";
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

  const renderLevelBadge = (level: string) => (
    <Badge color={getLevelColor(level)} size="sm" radius="sm" variant="light">
      Level {level}
    </Badge>
  );

  const renderEmpty = (msg: string) => (
    <Center h="60vh">
      <Text c="dimmed" size="sm" fw={500}>
        {msg}
      </Text>
    </Center>
  );

  const renderLoading = () => (
    <Center h="100vh">
      <Loader color="yellow" size="lg" variant="dots" />
    </Center>
  );

  return (
    <div className={classes.financialRecords}>
      <CommonHeader heading="My Wallet History" />

      <Container size="sm" mt="md">
        {/* Wallet Summary Card */}
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

        {/* Tabs Section */}
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
            <Tabs.Tab value="recharge">Recharge</Tabs.Tab>
            <Tabs.Tab value="withdrawal">Withdrawal</Tabs.Tab>
            <Tabs.Tab value="referral" leftSection={<FaUsers size={14} />}>
              Team Referral
            </Tabs.Tab>
          </Tabs.List>

          {/* Recharge Tab */}
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
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={4}>
                        {renderStatusBadge(r.status)}
                        <Text size="xs" fw={500}>
                          {r.orderId}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(r.createdAt)}
                        </Text>
                      </Stack>
                      <Text fw={700} fz="lg" c="green">
                        +₹{formatCurrency(r.amount)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          {/* Withdrawal Tab */}
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
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={4}>
                        {renderStatusBadge(w.status)}
                        <Text size="xs" fw={500}>
                          {w.bankName} ({w.ifscCode})
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(w.createdAt)}
                        </Text>
                      </Stack>
                      <Text fw={700} fz="lg" c="red">
                        -₹{formatCurrency(w.amount)}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          {/* Team Referral Tab */}
          <Tabs.Panel value="referral" pt="md">
            {referralLoading ? (
              renderLoading()
            ) : referralError ? (
              renderEmpty("Failed to load referral history")
            ) : !referralData?.history?.length ? (
              renderEmpty("No referral earnings yet. Start inviting friends!")
            ) : (
              <>
                {/* Total Earnings Summary */}
                <Paper
                  p="md"
                  radius="md"
                  withBorder
                  mb="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <Group justify="space-between">
                    <Box>
                      <Text size="sm" c="white" opacity={0.9}>
                        Total Referral Earnings
                      </Text>
                      <Text fw={700} fz="xl" c="white" mt={4}>
                        ₹{formatCurrency(referralData?.totalEarnings)}
                      </Text>
                    </Box>
                    <FaUsers size={32} color="rgba(255,255,255,0.3)" />
                  </Group>
                </Paper>

                {/* Referral History List */}
                <Stack>
                  {referralData.history.map((ref: any) => (
                    <Card
                      key={ref._id}
                      shadow="xs"
                      p="md"
                      radius="md"
                      withBorder
                    >
                      <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="nowrap"
                      >
                        <Group align="flex-start" gap="sm">
                          <Avatar
                            src={ref.referredUserId?.picture}
                            alt={ref.referredUserId?.name}
                            radius="xl"
                            size="md"
                            color="blue"
                          >
                            {ref.referredUserId?.name?.[0]?.toUpperCase() ||
                              "U"}
                          </Avatar>
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Group gap={6}>
                              {renderLevelBadge(ref.level)}
                              {renderStatusBadge(ref.status)}
                            </Group>
                            <Text fw={600} size="sm">
                              {ref.referredUserId?.name || "Unknown User"}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {ref.referredUserId?.phone || "N/A"}
                            </Text>
                            <Divider my={4} />
                            <Text size="xs" c="dimmed" lineClamp={2}>
                              {ref.description}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                              {formatDate(ref.createdAt)}
                            </Text>
                          </Stack>
                        </Group>
                        <Text
                          fw={700}
                          fz="lg"
                          c="green"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          +₹{formatCurrency(ref.amount)}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Tabs.Panel>
        </Tabs>
      </Container>
    </div>
  );
};

export default FinancialRecords;
