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
import { RiExchangeFundsLine } from "react-icons/ri";
import { FaStripe } from "react-icons/fa";
import { notifications } from "@mantine/notifications";
import {
  useWithdrawalSettings,
  useUpdateWithdrawalSettings,
  useTestBitgetConnection,
} from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";

const WithdrawalSettings = () => {
  const { data, isLoading } = useWithdrawalSettings();
  const updateSettingsMutation = useUpdateWithdrawalSettings();
  const testBitgetMutation = useTestBitgetConnection();

  const [formData, setFormData] = useState({
    stripeEnabled: false,
    bitgetEnabled: true,
    bitgetApiKey: "",
    bitgetSecretKey: "",
    bitgetPassphrase: "",
    bitgetNetwork: "trc20",
    bitgetCurrency: "USDT",
    usdExchangeRate: 83,
    minWithdrawalINR: 0.01,
    maxWithdrawalINR: 500000,
    stripeFeePercent: 2.9,
    bitgetFeePercent: 0.1,
    defaultWithdrawalMethod: "bitget" as "stripe" | "bitget",
    notes: "",
  });

  const [bitgetConnected, setBitgetConnected] = useState<boolean | null>(null);
  const [bitgetBalance, setBitgetBalance] = useState<string | null>(null);

  useEffect(() => {
    if (data?.settings) {
      setFormData({
        stripeEnabled: data.settings.stripeEnabled || false,
        bitgetEnabled: data.settings.bitgetEnabled || true,
        bitgetApiKey: "",
        bitgetSecretKey: "",
        bitgetPassphrase: "",
        bitgetNetwork: data.settings.bitgetNetwork || "trc20",
        bitgetCurrency: data.settings.bitgetCurrency || "USDT",
        usdExchangeRate: data.settings.usdExchangeRate || 83,
        minWithdrawalINR: data.settings.minWithdrawalINR || 0.01,
        maxWithdrawalINR: data.settings.maxWithdrawalINR || 500000,
        stripeFeePercent: data.settings.stripeFeePercent || 2.9,
        bitgetFeePercent: data.settings.bitgetFeePercent || 0.1,
        defaultWithdrawalMethod: data.settings.defaultWithdrawalMethod || "bitget",
        notes: data.settings.notes || "",
      });
    }
  }, [data]);

  const handleSaveSettings = async () => {
    try {
      const payload: any = { ...formData };
      // Only send API keys if they were entered
      if (!payload.bitgetApiKey) delete payload.bitgetApiKey;
      if (!payload.bitgetSecretKey) delete payload.bitgetSecretKey;
      if (!payload.bitgetPassphrase) delete payload.bitgetPassphrase;

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

  const handleTestBitget = async () => {
    try {
      const result = await testBitgetMutation.mutateAsync();
      setBitgetConnected(result.connected);
      if (result.balance) {
        setBitgetBalance(`${result.balance.free} ${result.currency}`);
      }
      notifications.show({
        title: "Bitget Connected",
        message: `Connection successful! Balance: ${result.balance?.free || 0} ${result.currency}`,
        color: "teal",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      setBitgetConnected(false);
      notifications.show({
        title: "Connection Failed",
        message: error.response?.data?.message || "Failed to connect to Bitget",
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
              Configure Stripe and Bitget withdrawal methods
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

            {/* Bitget */}
            <Paper withBorder p="md" bg={formData.bitgetEnabled ? "teal.0" : "gray.0"}>
              <Group justify="space-between" mb="sm">
                <Group>
                  <ThemeIcon size={40} color="teal" variant="light">
                    <RiExchangeFundsLine size={24} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>Bitget</Text>
                    <Text size="xs" c="dimmed">Crypto USDT withdrawals</Text>
                  </div>
                </Group>
                <Switch
                  checked={formData.bitgetEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, bitgetEnabled: e.target.checked })
                  }
                  color="teal"
                  size="md"
                />
              </Group>
              <Group>
                <Badge color={formData.bitgetEnabled ? "green" : "gray"}>
                  {formData.bitgetEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {bitgetConnected !== null && (
                  <Badge color={bitgetConnected ? "green" : "red"}>
                    {bitgetConnected ? "Connected" : "Disconnected"}
                  </Badge>
                )}
                {bitgetBalance && (
                  <Badge color="blue" variant="light">
                    Balance: {bitgetBalance}
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
                  defaultWithdrawalMethod: value as "stripe" | "bitget",
                })
              }
              data={[
                { value: "bitget", label: "Bitget (Crypto)" },
                { value: "stripe", label: "Stripe (Bank Transfer)" },
              ]}
            />
          </Card>
        </Grid.Col>

        {/* Bitget Configuration */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder p="lg">
            <Group justify="space-between" mb="md">
              <Text size="lg" fw={600}>
                <RiExchangeFundsLine style={{ marginRight: 8 }} />
                Bitget Configuration
              </Text>
              <Tooltip label="Test connection">
                <Button
                  variant="light"
                  color="teal"
                  size="xs"
                  onClick={handleTestBitget}
                  loading={testBitgetMutation.isPending}
                  leftSection={<FiRefreshCw size={14} />}
                >
                  Test Connection
                </Button>
              </Tooltip>
            </Group>

            <Alert icon={<FiAlertCircle />} color="teal" variant="light" mb="md">
              <Text size="xs">
                API keys are stored securely. Leave blank to keep existing keys.
              </Text>
            </Alert>

            <PasswordInput
              label="API Key"
              placeholder={data?.settings?.bitgetApiKeyConfigured ? "••••••••••••" : "Enter API Key"}
              value={formData.bitgetApiKey}
              onChange={(e) =>
                setFormData({ ...formData, bitgetApiKey: e.target.value })
              }
              mb="sm"
            />

            <PasswordInput
              label="Secret Key"
              placeholder={data?.settings?.bitgetApiKeyConfigured ? "••••••••••••" : "Enter Secret Key"}
              value={formData.bitgetSecretKey}
              onChange={(e) =>
                setFormData({ ...formData, bitgetSecretKey: e.target.value })
              }
              mb="sm"
            />

            <PasswordInput
              label="Passphrase"
              placeholder={data?.settings?.bitgetApiKeyConfigured ? "••••••••••••" : "Enter Passphrase"}
              value={formData.bitgetPassphrase}
              onChange={(e) =>
                setFormData({ ...formData, bitgetPassphrase: e.target.value })
              }
              mb="sm"
            />

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Network"
                  value={formData.bitgetNetwork}
                  onChange={(value) =>
                    setFormData({ ...formData, bitgetNetwork: value || "trc20" })
                  }
                  data={[
                    { value: "trc20", label: "Tron (TRC20)" },
                    { value: "bep20", label: "BSC (BEP20)" },
                    { value: "erc20", label: "Ethereum (ERC20)" },
                    { value: "matic", label: "Polygon" },
                    { value: "sol", label: "Solana" },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Currency"
                  value={formData.bitgetCurrency}
                  onChange={(value) =>
                    setFormData({ ...formData, bitgetCurrency: value || "USDT" })
                  }
                  data={[
                    { value: "USDT", label: "USDT" },
                    { value: "USDC", label: "USDC" },
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
              label="Bitget Fee (%)"
              description="Fee percentage for Bitget withdrawals"
              value={formData.bitgetFeePercent}
              onChange={(value) =>
                setFormData({ ...formData, bitgetFeePercent: Number(value) || 0.1 })
              }
              min={0}
              max={100}
              step={0.1}
              decimalScale={2}
              suffix="%"
            />

            <Alert icon={<FiAlertCircle />} color="blue" variant="light" mt="md">
              <Text size="xs">
                Note: Bitget also charges network fees which vary by blockchain.
                TRC20 has the lowest fees (~$1).
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
        icon={formData.bitgetEnabled ? <RiExchangeFundsLine /> : <FaStripe />}
        color={formData.bitgetEnabled ? "teal" : "violet"}
        title="Current Active Method"
      >
        <Text size="sm">
          <strong>{formData.bitgetEnabled ? "Bitget (Crypto)" : "Stripe (Bank Transfer)"}</strong> is currently the primary withdrawal method.
          {formData.bitgetEnabled && (
            <> Users will receive <strong>{formData.bitgetCurrency}</strong> on <strong>{formData.bitgetNetwork}</strong> network.</>
          )}
        </Text>
      </Alert>
    </Flex>
  );
};

export default WithdrawalSettings;
