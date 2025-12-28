import { useState, useEffect } from "react";
import {
  Text,
  Group,
  Flex,
  Paper,
  Switch,
  Button,
  TextInput,
  NumberInput,
  Select,
  Alert,
  Card,
  Badge,
  Divider,
  Grid,
  Loader,
  ThemeIcon,
  Tooltip,
  PasswordInput,
} from "@mantine/core";
import {
  FiSettings,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { SiBinance } from "react-icons/si";
import { FaStripe } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import {
  useWithdrawalSettings,
  useUpdateWithdrawalSettings,
  useTestBinanceConnection,
} from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";

const WithdrawalSettings = () => {
  const { data, isLoading } = useWithdrawalSettings();
  const updateSettingsMutation = useUpdateWithdrawalSettings();
  const testBinanceMutation = useTestBinanceConnection();

  const [formData, setFormData] = useState({
    stripeEnabled: false,
    binanceEnabled: true,
    binanceApiKey: "",
    binanceSecretKey: "",
    binanceNetwork: "BSC",
    binanceCurrency: "USDT",
    usdExchangeRate: 83,
    minWithdrawalINR: 0.01,
    maxWithdrawalINR: 500000,
    stripeFeePercent: 2.9,
    binanceFeePercent: 0.1,
    defaultWithdrawalMethod: "binance" as "stripe" | "binance",
    notes: "",
  });

  const [binanceConnected, setBinanceConnected] = useState<boolean | null>(null);
  const [binanceBalance, setBinanceBalance] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        stripeEnabled: data.settings.stripeEnabled || false,
        binanceEnabled: data.settings.binanceEnabled || true,
        binanceApiKey: "",
        binanceSecretKey: "",
        binanceNetwork: data.settings.binanceNetwork || "BSC",
        binanceCurrency: data.settings.binanceCurrency || "USDT",
        usdExchangeRate: data.settings.usdExchangeRate || 83,
        minWithdrawalINR: data.settings.minWithdrawalINR || 0.01,
        maxWithdrawalINR: data.settings.maxWithdrawalINR || 500000,
        stripeFeePercent: data.settings.stripeFeePercent || 2.9,
        binanceFeePercent: data.settings.binanceFeePercent || 0.1,
        defaultWithdrawalMethod: data.settings.defaultWithdrawalMethod || "binance",
        notes: data.settings.notes || "",
      });
    }
  }, [data]);

  const handleSaveSettings = async () => {
    try {
      const payload: any = { ...formData };
      // Only send API keys if they were entered
      if (!payload.binanceApiKey) delete payload.binanceApiKey;
      if (!payload.binanceSecretKey) delete payload.binanceSecretKey;

      await updateSettingsMutation.mutateAsync(payload);
      notifications.show({
        title: "Success",
        message: "Withdrawal settings updated successfully!",
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to update settings",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const handleTestBinance = async () => {
    try {
      const result = await testBinanceMutation.mutateAsync();
      setBinanceConnected(result.connected);
      if (result.balance) {
        setBinanceBalance(`${result.balance.free} ${result.currency}`);
      }
      notifications.show({
        title: "Binance Connected",
        message: `Connection successful! Balance: ${result.balance?.free || 0} ${result.currency}`,
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      setBinanceConnected(false);
      notifications.show({
        title: "Connection Failed",
        message: error.response?.data?.message || "Failed to connect to Binance",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: "400px" }}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="md" className={classes.container}>
      <Paper p="md" shadow="xs" className={classes.header}>
        <Group justify="space-between">
          <Flex gap="xs" direction="column" align="flex-start">
            <Text size="xl" fw={700} className={classes.title}>
              <FiSettings style={{ marginRight: 8 }} />
              USD Withdrawal Settings
            </Text>
            <Text size="sm" c="dimmed">
              Configure Stripe and Binance withdrawal methods
            </Text>
          </Flex>
          <Button
            onClick={handleSaveSettings}
            loading={updateSettingsMutation.isPending}
            leftSection={<FiCheckCircle />}
            color="green"
          >
            Save Settings
          </Button>
        </Group>
      </Paper>

      <Grid>
        {/* Withdrawal Methods */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Text size="lg" fw={600} mb="md">
              Payment Methods
            </Text>

            {/* Stripe */}
            <Paper withBorder p="md" mb="md" bg={formData.stripeEnabled ? "blue.0" : "gray.0"}>
              <Group justify="space-between" mb="sm">
                <Group>
                  <ThemeIcon size={40} color="violet" variant="light">
                    <FaStripe size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>Stripe</Text>
                    <Text size="xs" c="dimmed">Bank transfer withdrawals</Text>
                  </div>
                </Group>
                <Switch
                  checked={formData.stripeEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, stripeEnabled: e.target.checked })
                  }
                  color="violet"
                  size="md"
                />
              </Group>
              <Badge color={formData.stripeEnabled ? "green" : "gray"}>
                {formData.stripeEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </Paper>

            {/* Binance */}
            <Paper withBorder p="md" bg={formData.binanceEnabled ? "yellow.0" : "gray.0"}>
              <Group justify="space-between" mb="sm">
                <Group>
                  <ThemeIcon size={40} color="yellow" variant="light">
                    <SiBinance size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>Binance</Text>
                    <Text size="xs" c="dimmed">Crypto USDT withdrawals</Text>
                  </div>
                </Group>
                <Switch
                  checked={formData.binanceEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, binanceEnabled: e.target.checked })
                  }
                  color="yellow"
                  size="md"
                />
              </Group>
              <Group>
                <Badge color={formData.binanceEnabled ? "green" : "gray"}>
                  {formData.binanceEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {binanceConnected !== null && (
                  <Badge color={binanceConnected ? "green" : "red"}>
                    {binanceConnected ? "Connected" : "Disconnected"}
                  </Badge>
                )}
                {binanceBalance && (
                  <Badge color="blue" variant="light">
                    Balance: {binanceBalance}
                  </Badge>
                )}
              </Group>
            </Paper>

            <Divider my="md" />

            {/* Default Method */}
            <Select
              label="Default Withdrawal Method"
              description="Method used when user doesn't specify"
              value={formData.defaultWithdrawalMethod}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  defaultWithdrawalMethod: value as "stripe" | "binance",
                })
              }
              data={[
                { value: "binance", label: "Binance (Crypto)" },
                { value: "stripe", label: "Stripe (Bank Transfer)" },
              ]}
            />
          </Card>
        </Grid.Col>

        {/* Binance Configuration */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                <SiBinance style={{ marginRight: 8 }} />
                Binance Configuration
              </Text>
              <Tooltip label="Test connection">
                <Button
                  variant="light"
                  color="yellow"
                  size="xs"
                  onClick={handleTestBinance}
                  loading={testBinanceMutation.isPending}
                  leftSection={<FiRefreshCw size={14} />}
                >
                  Test Connection
                </Button>
              </Tooltip>
            </Group>

            <Alert icon={<FiAlertCircle />} color="yellow" variant="light" mb="md">
              <Text size="xs">
                API keys are stored securely. Leave blank to keep existing keys.
              </Text>
            </Alert>

            <PasswordInput
              label="API Key"
              placeholder={data?.settings?.binanceApiKeyConfigured ? "••••••••••••" : "Enter API Key"}
              value={formData.binanceApiKey}
              onChange={(e) =>
                setFormData({ ...formData, binanceApiKey: e.target.value })
              }
              mb="sm"
            />

            <PasswordInput
              label="Secret Key"
              placeholder={data?.settings?.binanceApiKeyConfigured ? "••••••••••••" : "Enter Secret Key"}
              value={formData.binanceSecretKey}
              onChange={(e) =>
                setFormData({ ...formData, binanceSecretKey: e.target.value })
              }
              mb="sm"
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Network"
                  value={formData.binanceNetwork}
                  onChange={(value) =>
                    setFormData({ ...formData, binanceNetwork: value || "BSC" })
                  }
                  data={[
                    { value: "BSC", label: "BSC (BEP20)" },
                    { value: "ETH", label: "Ethereum (ERC20)" },
                    { value: "TRX", label: "Tron (TRC20)" },
                    { value: "MATIC", label: "Polygon" },
                    { value: "SOL", label: "Solana" },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Currency"
                  value={formData.binanceCurrency}
                  onChange={(value) =>
                    setFormData({ ...formData, binanceCurrency: value || "USDT" })
                  }
                  data={[
                    { value: "USDT", label: "USDT" },
                    { value: "USDC", label: "USDC" },
                    { value: "BUSD", label: "BUSD" },
                  ]}
                />
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        {/* Withdrawal Limits & Fees */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Text size="lg" fw={600} mb="md">
              <FiDollarSign style={{ marginRight: 8 }} />
              Withdrawal Limits
            </Text>

            <NumberInput
              label="Minimum Withdrawal (INR)"
              value={formData.minWithdrawalINR}
              onChange={(value) =>
                setFormData({ ...formData, minWithdrawalINR: Number(value) || 0.01 })
              }
              min={100}
              step={100}
              prefix="₹"
              thousandSeparator=","
              mb="sm"
            />

            <NumberInput
              label="Maximum Withdrawal (INR)"
              value={formData.maxWithdrawalINR}
              onChange={(value) =>
                setFormData({ ...formData, maxWithdrawalINR: Number(value) || 500000 })
              }
              min={1000}
              step={1000}
              prefix="₹"
              thousandSeparator=","
              mb="sm"
            />

            <NumberInput
              label="USD Exchange Rate (1 USD = X INR)"
              value={formData.usdExchangeRate}
              onChange={(value) =>
                setFormData({ ...formData, usdExchangeRate: Number(value) || 83 })
              }
              min={1}
              step={0.1}
              decimalScale={2}
              prefix="₹"
            />
          </Card>
        </Grid.Col>

        {/* Fees */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Text size="lg" fw={600} mb="md">
              Withdrawal Fees
            </Text>

            <NumberInput
              label="Stripe Fee (%)"
              description="Fee percentage for Stripe withdrawals"
              value={formData.stripeFeePercent}
              onChange={(value) =>
                setFormData({ ...formData, stripeFeePercent: Number(value) || 2.9 })
              }
              min={0}
              max={100}
              step={0.1}
              decimalScale={2}
              suffix="%"
              mb="sm"
            />

            <NumberInput
              label="Binance Fee (%)"
              description="Fee percentage for Binance withdrawals"
              value={formData.binanceFeePercent}
              onChange={(value) =>
                setFormData({ ...formData, binanceFeePercent: Number(value) || 0.1 })
              }
              min={0}
              max={100}
              step={0.1}
              decimalScale={2}
              suffix="%"
            />

            <Alert icon={<FiAlertCircle />} color="blue" variant="light" mt="md">
              <Text size="xs">
                Note: Binance also charges network fees which vary by blockchain.
                BSC has the lowest fees (~$0.30).
              </Text>
            </Alert>
          </Card>
        </Grid.Col>

        {/* Notes */}
        <Grid.Col span={12}>
          <Card withBorder p="lg">
            <TextInput
              label="Admin Notes"
              description="Internal notes about withdrawal configuration"
              placeholder="Add any notes here..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Card>
        </Grid.Col>
      </Grid>

      {/* Current Status */}
      <Alert
        icon={formData.binanceEnabled ? <SiBinance /> : <FaStripe />}
        color={formData.binanceEnabled ? "yellow" : "violet"}
        title="Current Active Method"
      >
        <Text size="sm">
          <strong>{formData.binanceEnabled ? "Binance (Crypto)" : "Stripe (Bank Transfer)"}</strong> is currently the primary withdrawal method.
          {formData.binanceEnabled && (
            <> Users will receive <strong>{formData.binanceCurrency}</strong> on <strong>{formData.binanceNetwork}</strong> network.</>
          )}
        </Text>
      </Alert>
    </Flex>
  );
};

export default WithdrawalSettings;
