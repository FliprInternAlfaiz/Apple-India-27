import React, { useState } from 'react';
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
} from '@mantine/core';
import { FaWallet, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  useWalletInfoQuery,
  useWithdrawalHistoryQuery,
} from '../../hooks/query/useWithdrawal.query';
import { useRechargeHistoryQuery } from '../../hooks/query/useRecharge.query';
import classes from './FinancialRecords.module.scss';

const FinancialRecords: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'recharge' | 'withdrawal'>('withdrawal');

  const { data: walletData, isLoading: walletLoading, isError: walletError } = useWalletInfoQuery();
  const { data: rechargeData, isLoading: rechargeLoading, isError: rechargeError } =
    useRechargeHistoryQuery({ page: 1, limit: 10 });
  const { data: withdrawalData, isLoading: withdrawalLoading, isError: withdrawalError } =
    useWithdrawalHistoryQuery({ page: 1, limit: 10 });

  const formatCurrency = (amt: number | undefined) =>
    (amt || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      completed: 'green',
      pending: 'yellow',
      processing: 'blue',
      rejected: 'red',
      failed: 'red',
    };
    return map[status.toLowerCase()] || 'gray';
  };

  const renderStatusBadge = (status: string) => (
    <Badge color={getStatusColor(status)} size="sm" radius="sm" variant="filled">
      {status.toUpperCase()}
    </Badge>
  );

  const renderEmpty = (msg: string) => (
    <Center py={80}>
      <Text c="dimmed" size="sm" fw={500}>
        {msg}
      </Text>
    </Center>
  );

  const renderLoading = () => (
    <Center py={80}>
      <Loader color="yellow" size="lg" />
    </Center>
  );

  return (
    <div className={classes.financialRecords}>
      {/* Header */}
      <header className={classes.header}>
        <div className={classes.backButton} onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </div>
        <h1 className={classes.title}>My Wallet</h1>
      </header>

      <Container size="sm" className={classes.container}>
        {/* Wallet Summary */}
        <Card className={classes.walletCard} radius="md" p="lg" withBorder>
          {walletError ? (
            <Center>
              <Text c="red">Failed to load wallet info</Text>
            </Center>
          ) : (
            <Group grow className={classes.walletInfo}>
              <div className={classes.walletSection}>
                <Group gap="xs" justify="center" className={classes.walletLabel}>
                  <FaWallet className={classes.walletIcon} />
                  <Text fw={500}>Recharge</Text>
                </Group>
                <Text fw={700} fz={26} className={classes.walletAmount}>
                  {walletLoading ? '...' : formatCurrency(walletData?.mainWallet || 0)}
                </Text>
              </div>
              <div className={classes.walletSection}>
                <Group gap="xs" justify="center" className={classes.walletLabel}>
                  <FaMoneyBillWave className={classes.walletIcon} />
                  <Text fw={500}>Withdrawal</Text>
                </Group>
                <Text fw={700} fz={26} className={classes.walletAmount}>
                  {walletLoading ? '...' : formatCurrency(walletData?.commissionWallet || 0)}
                </Text>
              </div>
            </Group>
          )}
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(v) => v && setActiveTab(v as any)}
          keepMounted={false}
          className={classes.historyTabs}
        >
          <Tabs.List grow className={classes.tabsList}>
            <Tabs.Tab value="recharge" className={classes.tab}>
              Recharge Record
            </Tabs.Tab>
            <Tabs.Tab value="withdrawal" className={classes.tab}>
              Withdrawal Record
            </Tabs.Tab>
          </Tabs.List>

          {/* Recharge History */}
          <Tabs.Panel value="recharge" pt="md">
            {rechargeLoading
              ? renderLoading()
              : rechargeError
              ? renderEmpty('Failed to load recharge history')
              : !rechargeData?.recharges?.length
              ? renderEmpty('No recharge history found')
              : (
                <Stack className={classes.recordsList}>
                  {rechargeData?.recharges?.map((r: any) => (
                    <Card key={r._id} className={classes.recordCard} radius="md" shadow="sm" withBorder>
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          {renderStatusBadge(r.status)}
                          <Text size="xs" fw={500} className={classes.recordId}>
                            {r.orderId}
                          </Text>
                          <Text size="xs" c="dimmed" className={classes.recordDate}>
                            {formatDate(r.createdAt)}
                          </Text>
                        </Stack>
                        <Text fw={700} fz="lg" className={classes.recordAmount}>
                          ₹{formatCurrency(r.amount)}
                        </Text>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
          </Tabs.Panel>

          {/* Withdrawal History */}
          <Tabs.Panel value="withdrawal" pt="md">
            {withdrawalLoading
              ? renderLoading()
              : withdrawalError
              ? renderEmpty('Failed to load withdrawal history')
              : !withdrawalData?.withdrawals?.length
              ? renderEmpty('No withdrawal history found')
              : (
                <Stack className={classes.recordsList}>
                  {withdrawalData?.withdrawals?.map((w: any) => (
                    <Card key={w._id} className={classes.recordCard} radius="md" shadow="sm" withBorder>
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4}>
                          {renderStatusBadge(w.status)}
                          <Text size="xs" fw={500}>
                            {w.bankName} ({w.ifscCode})
                          </Text>
                          <Text size="xs" c="dimmed" className={classes.recordDate}>
                            {formatDate(w.createdAt)}
                          </Text>
                        </Stack>
                        <Text fw={700} fz="lg" className={classes.recordAmount}>
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
