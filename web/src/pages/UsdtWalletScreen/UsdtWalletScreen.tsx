import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Flex,
  Divider,
  Tabs,
  NumberInput,
  PasswordInput,
  Badge,
  Loader,
  Alert,
  Center,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaStripeS,
  FaHistory,
  FaInfoCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import {
  useWalletInfoQuery,
  useCreateWithdrawalMutation,
  useWithdrawalHistoryQuery,
} from "../../hooks/query/useWithdrawal.query";
import classes from "./UsdtWalletScreen.module.scss";

const UsdtWalletScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("wallet");
  const [withdrawAmount, setWithdrawAmount] = useState<number | undefined>();
  const [withdrawalPassword, setWithdrawalPassword] = useState("");
  const [rechargeAmount, setRechargeAmount] = useState<number | undefined>();

  const { data: walletInfo, isLoading: walletLoading, refetch: refetchWallet } = useWalletInfoQuery();
  
  // Withdrawal History for USDT
  const { data: historyData, isLoading: historyLoading } = useWithdrawalHistoryQuery({
    page: 1,
    limit: 10,
    currency: 'USDT'
  });

  const createWithdrawalMutation = useCreateWithdrawalMutation();

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawalPassword) return;

    createWithdrawalMutation.mutate(
      {
        walletType: "mainWallet", // Defaulting to mainWallet for USDT as per simple flow
        amount: withdrawAmount,
        withdrawalPassword,
        currency: "USDT",
        bankAccountId: "STRIPE_WALLET" // Placeholder, backend will handle it or we updated backend to be optional
      },
      {
        onSuccess: () => {
          setWithdrawAmount(undefined);
          setWithdrawalPassword("");
          setActiveTab("history"); // Go to history after submit
          refetchWallet();
        },
      }
    );
  };

  if (walletLoading) {
    return (
      <Center h="100vh" bg="#f8f9fa">
        <Loader size="lg" color="orange" />
      </Center>
    );
  }

  const usdtBalance = walletInfo?.mainWalletUsdt || 0;
  const commissionBalance = walletInfo?.commissionWalletUsdt || 0;

  return (
    <div className={classes.container}>
      <Flex justify="space-between" align="center" mb="lg">
        <Text className={classes.title}>USDT Crypto Wallet</Text>
        <Badge size="lg" color="green" variant="light">Verified User</Badge>
      </Flex>

      {/* Balance Card */}
      <div className={classes.balanceCard}>
        <Flex justify="space-between" align="flex-start">
          <div>
            <Text size="sm" c="dimmed" style={{ color: 'rgba(255,255,255,0.7)' }}>Total Balance (USDT)</Text>
            <Text size="3rem" fw={700} lh={1} mt={4}>
              ${(usdtBalance + commissionBalance).toFixed(2)}
            </Text>
            <Text size="sm" mt="xs" c="dimmed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ≈ ₹{((usdtBalance + commissionBalance) * 85).toFixed(2)} INR
            </Text>
          </div>
          <ThemeIcon size={48} radius="xl" color="rgba(255,255,255,0.2)">
            <FaWallet size={24} color="white" />
          </ThemeIcon>
        </Flex>

        <Divider my="lg" color="rgba(255,255,255,0.1)" />

        <Flex gap="xl">
          <div>
             <Text size="xs" c="dimmed" style={{ color: 'rgba(255,255,255,0.6)' }}>Prime Wallet</Text>
             <Text fw={600} size="lg">${usdtBalance.toFixed(2)}</Text>
          </div>
          <div>
             <Text size="xs" c="dimmed" style={{ color: 'rgba(255,255,255,0.6)' }}>Task Wallet</Text>
             <Text fw={600} size="lg">${commissionBalance.toFixed(2)}</Text>
          </div>
        </Flex>
      </div>

      <Tabs 
        value={activeTab} 
        onChange={setActiveTab} 
        variant="pills" 
        radius="lg" 
        mb="lg"
        color="dark"
        styles={{
            tab: { padding: '12px 20px', fontWeight: 600 }
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="wallet" leftSection={<FaWallet />}>Details</Tabs.Tab>
          <Tabs.Tab value="withdraw" leftSection={<FaArrowDown />}>Withdraw</Tabs.Tab>
          <Tabs.Tab value="history" leftSection={<FaHistory />}>History</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="wallet">
            {/* Quick Actions */}
            <Flex gap="md" mt="lg">
                <Button 
                    fullWidth 
                    size="lg" 
                    color="green" 
                    leftSection={<FaArrowUp />}
                    onClick={() => setActiveTab('recharge')}
                    className={classes.actionButton}
                >
                    Deposit USDT
                </Button>
                <Button 
                    fullWidth 
                    size="lg" 
                    color="red"
                    variant="light"
                    leftSection={<FaArrowDown />}
                    onClick={() => setActiveTab('withdraw')}
                    className={classes.actionButton}
                >
                    Withdraw
                </Button>
            </Flex>

            <Alert icon={<FaInfoCircle />} title="USDT Wallet Features" color="blue" mt="lg" radius="md">
                <Stack>
                <Text size="sm">• Deposits are processed via Admin verification.</Text>
                <Text size="sm">• Withdrawals are processed instantly via Stripe to your connected account.</Text>
                <Text size="sm">• 1 USDT ≈ $1.00 USD</Text>
                </Stack>
            </Alert>
        </Tabs.Panel>

        <Tabs.Panel value="withdraw">
            <Card shadow="sm" radius="lg" p="xl" mt="lg">
                <Flex align="center" gap="md" mb="xl">
                    <FaStripeS size={40} color="#635bff" />
                    <div>
                        <Text fw={700} size="lg">Withdraw via Stripe</Text>
                        <Text size="sm" c="dimmed">Secure crypto payout to your bank/card</Text>
                    </div>
                </Flex>

                <Stack gap="lg">
                    <NumberInput
                        label="Withdrawal Amount (USDT)"
                        placeholder="Enter amount (min $10)"
                        min={10}
                        size="lg"
                        leftSection="$"
                        value={withdrawAmount}
                        onChange={(v) => setWithdrawAmount(Number(v))}
                    />

                    <PasswordInput
                        label="Withdrawal Password"
                        placeholder="Enter security password"
                        size="lg"
                        value={withdrawalPassword}
                        onChange={(e) => setWithdrawalPassword(e.target.value)}
                    />

                    <Button 
                        size="xl" 
                        fullWidth 
                        color="violet"
                        loading={createWithdrawalMutation.isPending}
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || !withdrawalPassword}
                    >
                        Confirm Withdrawal
                    </Button>
                </Stack>
            </Card>
        </Tabs.Panel>

        <Tabs.Panel value="recharge">
             <Card shadow="sm" radius="lg" p="xl" mt="lg">
                 <Text fw={700} size="lg" mb="md">Add Funds (USDT)</Text>
                 <Text size="sm" c="dimmed" mb="xl">
                     Please enter the amount you wish to deposit. Contact your administrator for the wallet address details.
                 </Text>

                 <NumberInput
                    label="Deposit Amount (USDT)"
                    placeholder="Enter amount"
                    size="lg"
                    min={1}
                    leftSection="$"
                    value={rechargeAmount}
                    onChange={(v) => setRechargeAmount(Number(v))}
                    mb="lg"
                 />

                 <Button fullWidth size="lg" color="green">
                    Request Deposit Details
                 </Button>

                 <Alert mt="lg" color="yellow" icon={<FaInfoCircle />}>
                     Automated USDT deposits are currently in beta. Please use manual admin verification.
                 </Alert>
             </Card>
        </Tabs.Panel>

        <Tabs.Panel value="history">
            <Card shadow="sm" radius="lg" p="md" mt="lg">
                <Text fw={700} mb="md">Transaction History</Text>
                
                {historyLoading ? (
                    <Center p="xl"><Loader /></Center>
                ) : (historyData?.data?.withdrawals?.length ?? 0) === 0 ? (
                    <Text c="dimmed" ta="center" py="xl">No transactions found</Text>
                ) : (
                    <Stack gap="sm">
                        {historyData?.data?.withdrawals?.map((item: any) => (
                            <Flex key={item._id} justify="space-between" align="center" className={classes.transactionItem}>
                                <Flex gap="md" align="center">
                                    <ThemeIcon 
                                        color={item.status === 'completed' ? 'green' : item.status === 'rejected' ? 'red' : 'yellow'} 
                                        variant="light" 
                                        radius="xl"
                                        size="lg"
                                    >
                                        {item.status === 'completed' ? <FaCheckCircle /> : item.status === 'rejected' ? <FaInfoCircle /> : <FaSpinner />}
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={600}>${item.amount}</Text>
                                        <Text size="xs" c="dimmed">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </div>
                                </Flex>
                                <Badge color={item.status === 'completed' ? 'green' : item.status === 'rejected' ? 'red' : 'yellow'}>
                                    {item.status.toUpperCase()}
                                </Badge>
                            </Flex>
                        ))}
                    </Stack>
                )}
            </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default UsdtWalletScreen;
