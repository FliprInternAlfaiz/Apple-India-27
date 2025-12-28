import React, { useState } from "react";
import {
  Text,
  Button,
  Modal,
  Card,
  Badge,
  Loader,
  Group,
  Divider,
  Alert,
  Center,
  Tabs,
  NumberInput,
  Stack,
  Paper,
  Title,
  ThemeIcon,
  Pagination,
  TextInput,
  Select,
  SegmentedControl,
} from "@mantine/core";
import {
  useUSDWalletInfo,
  useStripeConnectStatus,
  useUSDWithdrawalHistory,
  useUSDTransactionHistory,
  useCreateStripeConnectAccount,
  useWithdrawalMethods,
  useSaveBinanceWallet,
  useCreateUSDWithdrawalWithMethod,
} from "../../hooks/query/useUSDWithdrawal.query";
import classes from "./USDWithdrawalScreen.module.scss";
import {
  FaDollarSign,
  FaWallet,
  FaStripe,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExchangeAlt,
  FaHistory,
  FaInfoCircle,
  FaBan,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { SiBinance } from "react-icons/si";
import { notifications } from "@mantine/notifications";

const USDWithdrawalScreen: React.FC = () => {
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [binanceWalletModal, setBinanceWalletModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [binanceAddress, setBinanceAddress] = useState("");
  const [binanceNetwork, setBinanceNetwork] = useState("BSC");
  const [selectedMethod, setSelectedMethod] = useState<string>("binance");

  // Fetch data
  const { data: walletData, isLoading: walletLoading } = useUSDWalletInfo();
  const { data: connectStatus, isLoading: connectLoading } = useStripeConnectStatus();
  const { data: withdrawalHistory, isLoading: historyLoading } = useUSDWithdrawalHistory(historyPage, 10);
  const { data: transactionHistory, isLoading: transactionLoading } = useUSDTransactionHistory(transactionPage, 10);
  const { data: methodsData } = useWithdrawalMethods();

  // Mutations
  const createConnectMutation = useCreateStripeConnectAccount();
  const createWithdrawalMutation = useCreateUSDWithdrawalWithMethod();
  const saveBinanceWalletMutation = useSaveBinanceWallet();

  const predefinedAmounts = [1, 10, 100, 500, 1000, 5000];

  const wallet = walletData?.wallet;
  const exchangeRate = walletData?.currentExchangeRate || 83;
  const isOnboarded = connectStatus?.isOnboarded || false;
  const connectAccount = connectStatus?.stripeAccountId;
  
  // Binance settings
  const binanceEnabled = methodsData?.methods?.binance?.enabled || true;
  const stripeEnabled = methodsData?.methods?.stripe?.enabled || false;
  const binanceSettings = methodsData?.methods?.binance || {};
  
  // Check if user has saved Binance wallet
  const hasBinanceWallet = wallet?.binanceWalletAddress && wallet?.binanceVerified;

  const handleStripeOnboarding = () => {
    const returnUrl = window.location.origin + "/usd-withdrawal";
    createConnectMutation.mutate(returnUrl);
  };

  const handleSaveBinanceWallet = () => {
    if (!binanceAddress.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a valid wallet address",
        color: "red",
      });
      return;
    }

    saveBinanceWalletMutation.mutate(
      { binanceWalletAddress: binanceAddress, binanceNetwork },
      {
        onSuccess: () => {
          setBinanceWalletModal(false);
          setBinanceAddress("");
        },
      }
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      notifications.show({
        title: "Error",
        message: "Please enter a valid amount",
        color: "red",
      });
      return;
    }

    if (!wallet || withdrawAmount > wallet.balanceINR) {
      notifications.show({
        title: "Error",
        message: "Insufficient balance",
        color: "red",
      });
      return;
    }

    // Check if the selected method is available
    if (selectedMethod === "binance" && !hasBinanceWallet) {
      notifications.show({
        title: "Error",
        message: "Please add your Binance wallet address first",
        color: "red",
      });
      return;
    }

    if (selectedMethod === "stripe" && !isOnboarded) {
      notifications.show({
        title: "Error",
        message: "Please complete Stripe verification first",
        color: "red",
      });
      return;
    }

    createWithdrawalMutation.mutate(
      { amountINR: Number(withdrawAmount), withdrawalMethod: selectedMethod as 'stripe' | 'binance' },
      {
        onSuccess: () => {
          setWithdrawalModal(false);
          setWithdrawAmount(0);
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "yellow", icon: <FaClock /> },
      processing: { color: "blue", icon: <FaClock /> },
      completed: { color: "green", icon: <FaCheckCircle /> },
      rejected: { color: "red", icon: <FaTimesCircle /> },
      failed: { color: "red", icon: <FaBan /> },
    };

    const config = statusConfig[status] || { color: "gray", icon: null };
    return (
      <Badge color={config.color} leftSection={config.icon} size="sm">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    if (method === "binance") {
      return (
        <Badge color="yellow" leftSection={<SiBinance size={10} />} size="xs">
          Binance
        </Badge>
      );
    }
    return (
      <Badge color="violet" leftSection={<FaStripe size={10} />} size="xs">
        Stripe
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "admin_fund":
      case "credit":
        return <FaPlus color="#40c057" />;
      case "withdrawal":
      case "debit":
        return <FaMinus color="#fa5252" />;
      case "refund":
        return <FaExchangeAlt color="#fab005" />;
      default:
        return <FaDollarSign />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (walletLoading || connectLoading) {
    return (
      <div className={classes.loadingContainer}>
        <Loader size="lg" />
      </div>
    );
  }

  // Check if user is USD enabled
  if (!wallet && !walletLoading) {
    return (
      <div className={classes.container}>
        <Title order={2} className={classes.title}>
          USD Withdrawals
        </Title>

        <Card className={classes.card} p="xl" withBorder>
          <Center>
            <Stack align="center" gap="md">
              <ThemeIcon size={80} radius="xl" color="gray" variant="light">
                <FaBan size={40} />
              </ThemeIcon>
              <Text size="lg" fw={600} ta="center">
                USD Withdrawals Not Available
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Your account is not enabled for USD withdrawals. Please contact support if you believe this is an error.
              </Text>
            </Stack>
          </Center>
        </Card>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <Title order={2} className={classes.title}>
        USD Withdrawals
      </Title>

      {/* Wallet Balance Card */}
      <div className={classes.walletCard}>
        <div className={classes.walletHeader}>
          <Text className={classes.walletTitle}>
            <FaWallet style={{ marginRight: 8 }} />
            USD Wallet Balance
          </Text>
          <Group gap="xs">
            {binanceEnabled && hasBinanceWallet && (
              <Badge color="yellow" variant="light" size="sm" leftSection={<SiBinance size={10} />}>
                Binance Ready
              </Badge>
            )}
            {stripeEnabled && isOnboarded && (
              <Badge color="green" variant="light" size="sm" leftSection={<FaStripe size={10} />}>
                Stripe Connected
              </Badge>
            )}
          </Group>
        </div>

        <div className={classes.balanceSection}>
          <div className={classes.balanceItem}>
            <Text className={classes.balanceLabel}>Balance (INR)</Text>
            <Text className={`${classes.balanceValue} ${classes.inrBalance}`}>
              ₹{wallet?.balanceINR?.toLocaleString() || 0}
            </Text>
          </div>
          <div className={classes.balanceItem}>
            <Text className={classes.balanceLabel}>Balance (USD)</Text>
            <Text className={`${classes.balanceValue} ${classes.usdBalance}`}>
              ${wallet?.balanceUSD?.toFixed(2) || "0.00"}
            </Text>
          </div>
        </div>

        <Text className={classes.exchangeRate}>
          <FaExchangeAlt style={{ marginRight: 6 }} />
          Current Exchange Rate: 1 USD = ₹{exchangeRate}
        </Text>
      </div>

      {/* Binance Wallet Setup - Show if Binance is enabled and no wallet saved */}
      {binanceEnabled && !hasBinanceWallet && (
        <div className={classes.onboardingCard} style={{ background: "linear-gradient(135deg, #F0B90B 0%, #E6A100 100%)" }}>
          <SiBinance size={50} style={{ marginBottom: 16, color: "#1E2329" }} />
          <Text className={classes.onboardingTitle} style={{ color: "#1E2329" }}>
            Add Your Binance Wallet
          </Text>
          <Text className={classes.onboardingDesc} style={{ color: "#1E2329" }}>
            Add your {binanceSettings?.network || "BSC"} wallet address to receive {binanceSettings?.currency || "USDT"} withdrawals directly to your crypto wallet.
          </Text>
          <Button
          size="md"
            className={classes.stripeBtn}
            style={{ background: "#1E2329", color: "#F0B90B" }}
            onClick={() => setBinanceWalletModal(true)}
            leftSection={<SiBinance />}
          >
            Add Wallet Address
          </Button>
        </div>
      )}

      {/* Show saved Binance wallet */}
      {binanceEnabled && hasBinanceWallet && (
        <Card className={classes.statusCard} withBorder>
          <div className={classes.statusItem}>
            <div className={`${classes.statusIcon}`} style={{ background: "#F0B90B20" }}>
              <SiBinance color="#F0B90B" />
            </div>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600}>Binance Wallet Connected</Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {wallet?.binanceWalletAddress?.slice(0, 10)}...{wallet?.binanceWalletAddress?.slice(-10)}
              </Text>
              <Badge color="yellow" size="xs" mt="xs">
                {wallet?.binanceNetwork || "BSC"} Network
              </Badge>
            </div>
            <Button size="xs" variant="light" color="yellow" onClick={() => setBinanceWalletModal(true)}>
              Update
            </Button>
          </div>
        </Card>
      )}

      {/* Stripe Onboarding - Show if Stripe is enabled */}
      {stripeEnabled && !isOnboarded && (
        <div className={classes.onboardingCard}>
          <FaStripe size={50} style={{ marginBottom: 16 }} />
          <Text className={classes.onboardingTitle}>
            Connect Your Stripe Account
          </Text>
          <Text className={classes.onboardingDesc}>
            To receive USD withdrawals, you need to complete Stripe verification.
            This ensures secure and compliant international payouts.
          </Text>
          <Button
            className={classes.stripeBtn}
            onClick={handleStripeOnboarding}
            loading={createConnectMutation.isPending}
            leftSection={<FaStripe />}
          >
            {connectAccount ? "Complete Verification" : "Connect with Stripe"}
          </Button>
        </div>
      )}

      {/* Stripe Status */}
      {stripeEnabled && connectAccount && !isOnboarded && (
        <Card className={classes.statusCard} withBorder>
          <div className={classes.statusItem}>
            <div className={`${classes.statusIcon} ${classes.statusPending}`}>
              <FaClock />
            </div>
            <div>
              <Text size="sm" fw={600}>Verification Pending</Text>
              <Text size="xs" c="dimmed">
                Please complete the Stripe verification process
              </Text>
            </div>
          </div>
        </Card>
      )}

      {/* Withdrawal Action */}
      {(hasBinanceWallet || isOnboarded) && (
        <Card className={classes.card} p="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Create Withdrawal
          </Text>
          <Alert icon={<FaInfoCircle />} color="blue" variant="light" mb="md">
            Minimum withdrawal: ₹1 | Maximum: ₹500,000 per request
            {binanceEnabled && hasBinanceWallet && (
              <Text size="xs" mt="xs">
                Binance withdrawals are processed in {binanceSettings?.currency || "USDT"} on {binanceSettings?.network || "BSC"} network
              </Text>
            )}
          </Alert>
          <Button
            size="lg"
            fullWidth
            className={classes.withdrawBtn}
            onClick={() => setWithdrawalModal(true)}
            disabled={!wallet?.balanceINR || wallet.balanceINR < 1}
            leftSection={binanceEnabled ? <SiBinance /> : <FaDollarSign />}
          >
            Withdraw to {binanceEnabled && hasBinanceWallet ? "Crypto Wallet" : "USD"}
          </Button>
        </Card>
      )}

      {/* Tabs for History */}
      <div className={classes.tabsContainer}>
        <Tabs defaultValue="withdrawals" variant="pills">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="withdrawals" leftSection={<FaDollarSign size={14} />}>
              Withdrawals
            </Tabs.Tab>
            <Tabs.Tab value="transactions" leftSection={<FaHistory size={14} />}>
              Transactions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="withdrawals">
            <Card className={classes.card} withBorder>
              {historyLoading ? (
                <Center p="xl">
                  <Loader />
                </Center>
              ) : withdrawalHistory?.withdrawals?.length > 0 ? (
                <>
                  {withdrawalHistory.withdrawals.map((item: any) => (
                    <div key={item._id} className={classes.historyItem}>
                      <div className={classes.historyHeader}>
                        <Text className={classes.historyAmount}>
                          ₹{item.amountINR?.toLocaleString()} → ${item.amountUSD?.toFixed(2)}
                        </Text>
                        <Group gap="xs">
                          {getMethodBadge(item.withdrawalMethod || "stripe")}
                          {getStatusBadge(item.status)}
                        </Group>
                      </div>
                      <div className={classes.historyDetails}>
                        <Text size="xs" c="dimmed">
                          Rate: ₹{item.exchangeRate}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(item.createdAt)}
                        </Text>
                      </div>
                      {item.withdrawalMethod === "binance" && item.binanceTxHash && (
                        <Text size="xs" c="dimmed" mt="xs" style={{ fontFamily: "monospace" }}>
                          TX: {item.binanceTxHash.slice(0, 20)}...
                        </Text>
                      )}
                      {item.rejectionReason && (
                        <Text size="xs" c="red" mt="xs">
                          Reason: {item.rejectionReason}
                        </Text>
                      )}
                    </div>
                  ))}
                  {withdrawalHistory.totalPages > 1 && (
                    <Center mt="md">
                      <Pagination
                        value={historyPage}
                        onChange={setHistoryPage}
                        total={withdrawalHistory.totalPages}
                        size="sm"
                      />
                    </Center>
                  )}
                </>
              ) : (
                <div className={classes.noDataCard}>
                  <FaDollarSign className={classes.noDataIcon} />
                  <Text size="sm">No withdrawal history yet</Text>
                </div>
              )}
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="transactions">
            <Card className={classes.card} withBorder>
              {transactionLoading ? (
                <Center p="xl">
                  <Loader />
                </Center>
              ) : transactionHistory?.transactions?.length > 0 ? (
                <>
                  {transactionHistory.transactions.map((item: any) => (
                    <div key={item._id} className={classes.historyItem}>
                      <Group justify="space-between">
                        <Group gap="xs">
                          <ThemeIcon
                            variant="light"
                            color={item.type === "admin_fund" || item.type === "credit" ? "green" : item.type === "withdrawal" || item.type === "debit" ? "red" : "blue"}
                            size="sm"
                          >
                            {getTransactionIcon(item.type)}
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500} tt="capitalize">
                              {item.type.replace("_", " ")}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatDate(item.createdAt)}
                            </Text>
                          </div>
                        </Group>
                        <div style={{ textAlign: "right" }}>
                          <Text
                            size="sm"
                            fw={600}
                            c={item.type === "admin_fund" || item.type === "refund" || item.type === "credit" ? "green" : "red"}
                          >
                            {item.type === "admin_fund" || item.type === "refund" || item.type === "credit" ? "+" : "-"}
                            ₹{Math.abs(item.amountINR)?.toLocaleString()}
                          </Text>
                          {item.amountUSD && (
                            <Text size="xs" c="dimmed">
                              ${Math.abs(item.amountUSD)?.toFixed(2)}
                            </Text>
                          )}
                        </div>
                      </Group>
                      {item.description && (
                        <Text size="xs" c="dimmed" mt="xs">
                          {item.description}
                        </Text>
                      )}
                    </div>
                  ))}
                  {transactionHistory.totalPages > 1 && (
                    <Center mt="md">
                      <Pagination
                        value={transactionPage}
                        onChange={setTransactionPage}
                        total={transactionHistory.totalPages}
                        size="sm"
                      />
                    </Center>
                  )}
                </>
              ) : (
                <div className={classes.noDataCard}>
                  <FaHistory className={classes.noDataIcon} />
                  <Text size="sm">No transactions yet</Text>
                </div>
              )}
            </Card>
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        opened={withdrawalModal}
        onClose={() => setWithdrawalModal(false)}
        title="Create USD Withdrawal"
        centered
        size="md"
      >
        <Stack gap="md">
          {/* Method Selection - only show if both methods available */}
          {binanceEnabled && stripeEnabled && hasBinanceWallet && isOnboarded && (
            <div>
              <Text size="sm" fw={500} mb="xs">Withdrawal Method</Text>
              <SegmentedControl
                fullWidth
                value={selectedMethod}
                onChange={setSelectedMethod}
                data={[
                  { 
                    value: 'binance', 
                    label: (
                      <Group gap="xs" justify="center">
                        <SiBinance size={16} />
                        <span>Binance (Crypto)</span>
                      </Group>
                    )
                  },
                  { 
                    value: 'stripe', 
                    label: (
                      <Group gap="xs" justify="center">
                        <FaStripe size={16} />
                        <span>Stripe (Bank)</span>
                      </Group>
                    )
                  },
                ]}
              />
            </div>
          )}

          <Alert 
            icon={selectedMethod === 'binance' ? <SiBinance /> : <FaInfoCircle />} 
            color={selectedMethod === 'binance' ? "yellow" : "blue"} 
            variant="light"
          >
            {selectedMethod === 'binance' && binanceEnabled ? (
              <>
                Your INR will be converted to {binanceSettings?.currency || "USDT"} and sent to your wallet on {binanceSettings?.network || "BSC"} network.
                {wallet?.binanceWalletAddress && (
                  <Text size="xs" mt="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                    To: {wallet.binanceWalletAddress}
                  </Text>
                )}
              </>
            ) : (
              "Your INR will be converted to USD at the current exchange rate and sent to your Stripe account."
            )}
          </Alert>

          <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">Available Balance</Text>
              <Text size="sm" fw={600}>₹{wallet?.balanceINR?.toLocaleString() || 0}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Exchange Rate</Text>
              <Text size="sm" fw={600}>1 USD = ₹{exchangeRate}</Text>
            </Group>
          </Paper>

          <NumberInput
            label="Amount (INR)"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(val) => setWithdrawAmount(val as number)}
            min={1}
            max={Math.min(wallet?.balanceINR || 0, 500000)}
            step={1}
            prefix="₹"
            thousandSeparator=","
            size="md"
            decimalScale={2}
          />

          <Text size="sm" fw={500} c="dimmed">
            Quick Select:
          </Text>
          <div className={classes.amountGrid}>
            {predefinedAmounts.map((amount) => {
              const isDisabled = amount > (wallet?.balanceINR || 0);
              const isSelected = withdrawAmount === amount;
              return (
                <div
                  key={amount}
                  className={`${classes.amountCard} ${isSelected ? classes.amountSelected : ""} ${isDisabled ? classes.amountDisabled : ""}`}
                  onClick={() => !isDisabled && setWithdrawAmount(amount)}
                >
                  <Text size="sm" fw={500}>₹{amount.toLocaleString()}</Text>
                  <Text size="xs" c={isSelected ? "white" : "dimmed"}>
                    ~${(amount / exchangeRate).toFixed(2)}
                  </Text>
                </div>
              );
            })}
          </div>

          {withdrawAmount && Number(withdrawAmount) > 0 && (
            <Paper withBorder p="md" radius="md" bg={selectedMethod === 'binance' ? "yellow.0" : "green.0"}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>You will receive (approx)</Text>
                <Text size="lg" fw={700} c={selectedMethod === 'binance' ? "yellow.8" : "green"}>
                  {selectedMethod === 'binance' 
                    ? `${(Number(withdrawAmount) / exchangeRate).toFixed(2)} ${binanceSettings?.currency || "USDT"}`
                    : `$${(Number(withdrawAmount) / exchangeRate).toFixed(2)} USD`
                  }
                </Text>
              </Group>
            </Paper>
          )}

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
             size="md"
              variant="light"
              onClick={() => setWithdrawalModal(false)}
              disabled={createWithdrawalMutation.isPending}
              radius="md"
            >
              Cancel
            </Button>
            <Button
            size="md"
              className={classes.withdrawBtn}
              onClick={handleWithdraw}
              loading={createWithdrawalMutation.isPending}
              disabled={!withdrawAmount || Number(withdrawAmount) < 1}
              leftSection={selectedMethod === 'binance' ? <SiBinance /> : <FaDollarSign />}
              style={selectedMethod === 'binance' ? { background: "#F0B90B", color: "#1E2329" } : undefined}
            >
              Withdraw via {selectedMethod === 'binance' ? 'Binance' : 'Stripe'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Binance Wallet Modal */}
      <Modal
        opened={binanceWalletModal}
        onClose={() => setBinanceWalletModal(false)}
        title="Add Binance Wallet Address"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<SiBinance />} color="yellow" variant="light">
            <Text size="sm">
              Enter your {binanceSettings?.currency || "USDT"} wallet address. Make sure it supports the {binanceSettings?.network || "BSC"} network.
            </Text>
          </Alert>

          <Select
            label="Network"
            description="Select the blockchain network for receiving funds"
            value={binanceNetwork}
            onChange={(val) => setBinanceNetwork(val || "BSC")}
            data={[
              { value: "BSC", label: "BSC (BEP20) - Lowest Fees" },
              { value: "ETH", label: "Ethereum (ERC20)" },
              { value: "TRX", label: "Tron (TRC20)" },
              { value: "MATIC", label: "Polygon" },
              { value: "SOL", label: "Solana" },
            ]}
          />

          <TextInput
            label="Wallet Address"
            placeholder="Enter your wallet address"
            value={binanceAddress}
            onChange={(e) => setBinanceAddress(e.target.value)}
            description="Double-check your address. Incorrect addresses may result in lost funds."
          />

          {wallet?.binanceWalletAddress && (
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed">Current Address:</Text>
              <Text size="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {wallet.binanceWalletAddress}
              </Text>
            </Paper>
          )}

          <Alert icon={<FaInfoCircle />} color="red" variant="light">
            <Text size="xs">
              <strong>Warning:</strong> Sending to an incorrect address or wrong network will result in permanent loss of funds. We are not responsible for lost funds due to user error.
            </Text>
          </Alert>

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              size="md"
              variant="light"
              onClick={() => setBinanceWalletModal(false)}
              disabled={saveBinanceWalletMutation.isPending}
              radius="md"
            >
              Cancel
            </Button>
            <Button
              size="md"
              onClick={handleSaveBinanceWallet}
              loading={saveBinanceWalletMutation.isPending}
              disabled={!binanceAddress.trim()}
              leftSection={<SiBinance />}
              style={{ background: "#F0B90B", color: "#1E2329" }}
            >
              Save Wallet
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};

export default USDWithdrawalScreen;
