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
  useSaveBitgetWallet,
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
import { RiExchangeFundsLine } from "react-icons/ri";
import { notifications } from "@mantine/notifications";

const USDWithdrawalScreen: React.FC = () => {
  const [withdrawalModal, setWithdrawalModal] = useState(false);
  const [bitgetWalletModal, setBitgetWalletModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | "">(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [bitgetAddress, setBitgetAddress] = useState("");
  const [bitgetNetwork, setBitgetNetwork] = useState("trc20");
  const [selectedMethod, setSelectedMethod] = useState<string>("bitget");

  // Fetch data
  const { data: walletData, isLoading: walletLoading } = useUSDWalletInfo();
  const { data: connectStatus, isLoading: connectLoading } = useStripeConnectStatus();
  const { data: withdrawalHistory, isLoading: historyLoading } = useUSDWithdrawalHistory(historyPage, 10);
  const { data: transactionHistory, isLoading: transactionLoading } = useUSDTransactionHistory(transactionPage, 10);
  const { data: methodsData } = useWithdrawalMethods();

  // Mutations
  const createConnectMutation = useCreateStripeConnectAccount();
  const createWithdrawalMutation = useCreateUSDWithdrawalWithMethod();
  const saveBitgetWalletMutation = useSaveBitgetWallet();

  const predefinedAmounts = [1, 10, 100, 500, 1000, 5000];

  // Bitget minimum withdrawal amounts per network (from Bitget API - all networks require 10 USDT)
  const bitgetMinimums: Record<string, number> = {
    'trc20': 10,        // TRC20 minimum 10 USDT (fee: 1.5 USDT)
    'bep20': 10,        // BEP20 minimum 10 USDT (fee: 0.15 USDT)
    'erc20': 10,        // ERC20 minimum 10 USDT (fee: 1.6 USDT)
    'polygon': 10,      // Polygon minimum 10 USDT (fee: 0.2 USDT)
    'arbitrumone': 10,  // Arbitrum minimum 10 USDT (fee: 0.15 USDT)
    'arbitrum': 10,     // Arbitrum alias
    'optimism': 10,     // Optimism minimum 10 USDT (fee: 0.15 USDT)
    'sol': 10,          // Solana minimum 10 USDT (fee: 1 USDT)
    'ton': 10,          // TON minimum 10 USDT (fee: 0.15 USDT)
    'aptos': 10,        // Aptos minimum 10 USDT (fee: 0.03 USDT)
    'avaxc-chain': 10,  // AVAX minimum 10 USDT (fee: 0.11 USDT)
    'morph': 10,        // Morph minimum 10 USDT (fee: 0.1 USDT)
  };

  const wallet = walletData?.wallet;
  const exchangeRate = walletData?.currentExchangeRate || 83;
  const isOnboarded = connectStatus?.isOnboarded || false;
  const connectAccount = connectStatus?.stripeAccountId;
  
  // Bitget settings
  const bitgetEnabled = methodsData?.methods?.bitget?.enabled || true;
  const stripeEnabled = methodsData?.methods?.stripe?.enabled || false;
  const bitgetSettings = methodsData?.methods?.bitget || {};
  
  // Check if user has saved Bitget wallet
  const hasBitgetWallet = wallet?.bitgetWalletAddress && wallet?.bitgetVerified;

  const handleStripeOnboarding = () => {
    const returnUrl = window.location.origin + "/usd-withdrawal";
    createConnectMutation.mutate(returnUrl);
  };

  const handleSaveBitgetWallet = () => {
    if (!bitgetAddress.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter a valid wallet address",
        color: "red",
      });
      return;
    }

    saveBitgetWalletMutation.mutate(
      { bitgetWalletAddress: bitgetAddress, bitgetNetwork },
      {
        onSuccess: () => {
          setBitgetWalletModal(false);
          setBitgetAddress("");
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
    if (selectedMethod === "bitget" && !hasBitgetWallet) {
      notifications.show({
        title: "Error",
        message: "Please add your Bitget wallet address first",
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

    // Check Bitget minimum withdrawal amount
    if (selectedMethod === "bitget") {
      const network = wallet?.bitgetNetwork || 'trc20';
      const minUSD = bitgetMinimums[network.toLowerCase()] || 10;
      const minINR = Math.ceil(minUSD * exchangeRate * 1.01); // Add 1% buffer for fees
      const amountUSD = Number(withdrawAmount) / exchangeRate;
      
      if (amountUSD < minUSD) {
        notifications.show({
          title: "Minimum Not Met",
          message: `Bitget ${network.toUpperCase()} requires minimum $${minUSD} USDT. Please withdraw at least ₹${minINR.toLocaleString()} (current: $${amountUSD.toFixed(2)})`,
          color: "red",
        });
        return;
      }
    }

    createWithdrawalMutation.mutate(
      { amountINR: Number(withdrawAmount), withdrawalMethod: selectedMethod as 'stripe' | 'bitget' },
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
    if (method === "bitget") {
      return (
        <Badge color="teal" leftSection={<RiExchangeFundsLine size={10} />} size="xs">
          Bitget
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
            {bitgetEnabled && hasBitgetWallet && (
              <Badge color="teal" variant="light" size="sm" leftSection={<RiExchangeFundsLine size={10} />}>
                Bitget Ready
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

      {/* Bitget Wallet Setup - Show if Bitget is enabled and no wallet saved */}
      {bitgetEnabled && !hasBitgetWallet && (
        <div className={classes.onboardingCard} style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00B894 100%)" }}>
          <RiExchangeFundsLine size={50} style={{ marginBottom: 16, color: "#FFFFFF" }} />
          <Text className={classes.onboardingTitle} style={{ color: "#FFFFFF" }}>
            Add Your Bitget Wallet
          </Text>
          <Text className={classes.onboardingDesc} style={{ color: "#FFFFFF" }}>
            Add your {bitgetSettings?.network || "TRC20"} wallet address to receive {bitgetSettings?.currency || "USDT"} withdrawals directly to your crypto wallet.
          </Text>
          <Button
          size="md"
            className={classes.stripeBtn}
            style={{ background: "#FFFFFF", color: "#00D4AA" }}
            onClick={() => setBitgetWalletModal(true)}
            leftSection={<RiExchangeFundsLine />}
          >
            Add Wallet Address
          </Button>
        </div>
      )}

      {/* Show saved Bitget wallet */}
      {bitgetEnabled && hasBitgetWallet && (
        <Card className={classes.statusCard} withBorder>
          <div className={classes.statusItem}>
            <div className={`${classes.statusIcon}`} style={{ background: "#00D4AA20" }}>
              <RiExchangeFundsLine color="#00D4AA" />
            </div>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={600}>Bitget Wallet Connected</Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {wallet?.bitgetWalletAddress?.slice(0, 10)}...{wallet?.bitgetWalletAddress?.slice(-10)}
              </Text>
              <Badge color="teal" size="xs" mt="xs">
                {wallet?.bitgetNetwork || "TRC20"} Network
              </Badge>
            </div>
            <Button size="xs" variant="light" color="teal" onClick={() => setBitgetWalletModal(true)}>
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
      {(hasBitgetWallet || isOnboarded) && (
        <Card className={classes.card} p="md" withBorder>
          <Text size="lg" fw={600} mb="md">
            Create Withdrawal
          </Text>
          <Alert icon={<FaInfoCircle />} color="blue" variant="light" mb="md">
            Minimum withdrawal: ₹1 | Maximum: ₹500,000 per request
            {bitgetEnabled && hasBitgetWallet && (
              <Text size="xs" mt="xs">
                Bitget withdrawals are processed in {bitgetSettings?.currency || "USDT"} on {bitgetSettings?.network || "TRC20"} network
              </Text>
            )}
          </Alert>
          <Button
            size="lg"
            fullWidth
            className={classes.withdrawBtn}
            onClick={() => setWithdrawalModal(true)}
            disabled={!wallet?.balanceINR || wallet.balanceINR < 1}
            leftSection={bitgetEnabled ? <RiExchangeFundsLine /> : <FaDollarSign />}
          >
            Withdraw to {bitgetEnabled && hasBitgetWallet ? "Crypto Wallet" : "USD"}
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
                      {item.withdrawalMethod === "bitget" && item.bitgetTxHash && (
                        <Text size="xs" c="dimmed" mt="xs" style={{ fontFamily: "monospace" }}>
                          TX: {item.bitgetTxHash.slice(0, 20)}...
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
          {bitgetEnabled && stripeEnabled && hasBitgetWallet && isOnboarded && (
            <div>
              <Text size="sm" fw={500} mb="xs">Withdrawal Method</Text>
              <SegmentedControl
                fullWidth
                value={selectedMethod}
                onChange={setSelectedMethod}
                data={[
                  { 
                    value: 'bitget', 
                    label: (
                      <Group gap="xs" justify="center">
                        <RiExchangeFundsLine size={16} />
                        <span>Bitget (Crypto)</span>
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
            icon={selectedMethod === 'bitget' ? <RiExchangeFundsLine /> : <FaInfoCircle />} 
            color={selectedMethod === 'bitget' ? "teal" : "blue"} 
            variant="light"
          >
            {selectedMethod === 'bitget' && bitgetEnabled ? (
              <>
                Your INR will be converted to {bitgetSettings?.currency || "USDT"} and sent to your wallet on {(wallet?.bitgetNetwork || bitgetSettings?.network || "trc20").toUpperCase()} network.
                {wallet?.bitgetWalletAddress && (
                  <Text size="xs" mt="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                    To: {wallet.bitgetWalletAddress}
                  </Text>
                )}
                <Text size="xs" mt="xs" fw={600} c="orange">
                  ⚠️ Minimum: ${bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10} USDT 
                  (~₹{Math.ceil((bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10) * exchangeRate * 1.01).toLocaleString()})
                </Text>
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
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">Exchange Rate</Text>
              <Text size="sm" fw={600}>1 USD = ₹{exchangeRate}</Text>
            </Group>
            {withdrawAmount && Number(withdrawAmount) > 0 && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">You will receive</Text>
                <Text size="sm" fw={600} c={Number(withdrawAmount) / exchangeRate >= (bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10) ? "green" : "red"}>
                  ~${(Number(withdrawAmount) / exchangeRate).toFixed(2)} USDT
                </Text>
              </Group>
            )}
          </Paper>

          <NumberInput
            label="Amount (INR)"
            description={selectedMethod === 'bitget' ? `Min: ₹${Math.ceil((bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10) * exchangeRate * 1.01).toLocaleString()} (~$${bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10} USDT)` : undefined}
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
            error={selectedMethod === 'bitget' && withdrawAmount && Number(withdrawAmount) / exchangeRate < (bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10) ? `Amount below minimum ($${bitgetMinimums[(wallet?.bitgetNetwork || 'trc20').toLowerCase()] || 10} USDT)` : undefined}
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
            <Paper withBorder p="md" radius="md" bg={selectedMethod === 'bitget' ? "teal.0" : "green.0"}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>You will receive (approx)</Text>
                <Text size="lg" fw={700} c={selectedMethod === 'bitget' ? "teal.8" : "green"}>
                  {selectedMethod === 'bitget' 
                    ? `${(Number(withdrawAmount) / exchangeRate).toFixed(2)} ${bitgetSettings?.currency || "USDT"}`
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
              leftSection={selectedMethod === 'bitget' ? <RiExchangeFundsLine /> : <FaDollarSign />}
              style={selectedMethod === 'bitget' ? { background: "#00D4AA", color: "#FFFFFF" } : undefined}
            >
              Withdraw via {selectedMethod === 'bitget' ? 'Bitget' : 'Stripe'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Bitget Wallet Modal */}
      <Modal
        opened={bitgetWalletModal}
        onClose={() => setBitgetWalletModal(false)}
        title="Add Bitget Wallet Address"
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert icon={<RiExchangeFundsLine />} color="teal" variant="light">
            <Text size="sm">
              Enter your {bitgetSettings?.currency || "USDT"} wallet address. Make sure it supports the {bitgetSettings?.network || "TRC20"} network.
            </Text>
          </Alert>

          <Select
            label="Network"
            description="Select the blockchain network for receiving funds"
            value={bitgetNetwork}
            onChange={(val) => setBitgetNetwork(val || "trc20")}
            data={[
              { value: "trc20", label: "Tron (TRC20) - Lowest Fees" },
              { value: "bep20", label: "BSC (BEP20)" },
              { value: "erc20", label: "Ethereum (ERC20)" },
              { value: "matic", label: "Polygon" },
              { value: "sol", label: "Solana" },
            ]}
          />

          <TextInput
            label="Wallet Address"
            placeholder="Enter your wallet address"
            value={bitgetAddress}
            onChange={(e) => setBitgetAddress(e.target.value)}
            description="Double-check your address. Incorrect addresses may result in lost funds."
          />

          {wallet?.bitgetWalletAddress && (
            <Paper withBorder p="sm" radius="md" bg="gray.0">
              <Text size="xs" c="dimmed">Current Address:</Text>
              <Text size="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {wallet.bitgetWalletAddress}
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
              onClick={() => setBitgetWalletModal(false)}
              disabled={saveBitgetWalletMutation.isPending}
              radius="md"
            >
              Cancel
            </Button>
            <Button
              size="md"
              onClick={handleSaveBitgetWallet}
              loading={saveBitgetWalletMutation.isPending}
              disabled={!bitgetAddress.trim()}
              leftSection={<RiExchangeFundsLine />}
              style={{ background: "#00D4AA", color: "#FFFFFF" }}
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
