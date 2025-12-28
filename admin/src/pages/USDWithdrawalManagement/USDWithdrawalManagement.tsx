import { useState } from "react";
import {
  Text,
  Group,
  Flex,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Select,
  Modal,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  Grid,
  Card,
  Divider,
  Button,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import {
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { FaStripe } from "react-icons/fa";
import { SiBinance } from "react-icons/si";
import { notifications } from "@mantine/notifications";
import {
  useAllUSDWithdrawals,
  useApproveUSDWithdrawal,
  useRejectUSDWithdrawal,
  useWithdrawalSettings,
  useBinanceBalance,
} from "../../hooks/query/USDWithdrawal.query";
import classes from "./index.module.scss";

const USDWithdrawalManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const [viewModal, setViewModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = useAllUSDWithdrawals({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const approveUSDWithdrawalMutation = useApproveUSDWithdrawal();
  const rejectUSDWithdrawalMutation = useRejectUSDWithdrawal();
  const { data: settingsData } = useWithdrawalSettings();
  const { data: binanceBalanceData, isLoading: binanceLoading, refetch: refetchBinanceBalance } = useBinanceBalance();

  const withdrawals = data?.withdrawals || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  const currentMethod = settingsData?.settings?.binanceEnabled ? "binance" : "stripe";

  const handleView = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setViewModal(true);
  };

  const handleApprove = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setApproveModal(true);
  };

  const handleReject = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRejectReason("");
    setRejectModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      await approveUSDWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        remarks: remarks || `Approved and processed via ${selectedWithdrawal.withdrawalMethod === 'binance' ? 'Binance' : 'Stripe'}`,
      });

      const method = selectedWithdrawal.withdrawalMethod === 'binance' ? 'Binance (Crypto)' : 'Stripe';
      notifications.show({
        title: "Success",
        message: `USD withdrawal approved and processed via ${method}!`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setApproveModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to approve USD withdrawal",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedWithdrawal) return;

    if (!rejectReason.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide a rejection reason",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await rejectUSDWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        reason: rejectReason,
      });

      notifications.show({
        title: "Success",
        message: "USD withdrawal rejected. Amount refunded to user's USD Wallet.",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setRejectModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject USD withdrawal",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "yellow",
      processing: "blue",
      completed: "green",
      rejected: "red",
      failed: "orange",
    };
    return (
      <Badge color={colors[status] || "gray"} size="sm">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    if (method === "binance") {
      return (
        <Badge color="yellow" size="sm" leftSection={<SiBinance size={10} />}>
          Binance
        </Badge>
      );
    }
    return (
      <Badge color="violet" size="sm" leftSection={<FaStripe size={10} />}>
        Stripe
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: "400px" }}>
        <Loader size="lg" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load USD withdrawals. Please try again.
      </Alert>
    );
  }

  const rows = withdrawals.map((withdrawal: any) => (
    <Table.Tr key={withdrawal._id}>
      <Table.Td>
        <div>
          <Text size="sm" fw={500}>
            {withdrawal._id.slice(-8)}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(withdrawal.createdAt)}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <div>
          <Text size="sm" fw={500}>
            {withdrawal.userId?.name || "N/A"}
          </Text>
          <Text size="xs" c="dimmed">
            {withdrawal.userId?.phone || "N/A"}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="green">
          ${withdrawal.amountUSD?.toFixed(2)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          ₹{withdrawal.amountINR?.toFixed(2)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{withdrawal.exchangeRate}</Text>
      </Table.Td>
      <Table.Td>{getMethodBadge(withdrawal.withdrawalMethod || "stripe")}</Table.Td>
      <Table.Td>{getStatusBadge(withdrawal.status)}</Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
          {withdrawal.withdrawalMethod === "binance" 
            ? (withdrawal.binanceTxHash ? withdrawal.binanceTxHash.slice(-12) : withdrawal.binanceWithdrawId || "-")
            : (withdrawal.stripeTransferId ? withdrawal.stripeTransferId.slice(-12) : "-")}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleView(withdrawal)}
            >
              <FiEye size={14} />
            </ActionIcon>
          </Tooltip>
          {withdrawal.status === "pending" && (
            <>
              <Tooltip label={`Approve & Process via ${withdrawal.withdrawalMethod === 'binance' ? 'Binance' : 'Stripe'}`}>
                <ActionIcon
                  variant="light"
                  color="green"
                  size="sm"
                  onClick={() => handleApprove(withdrawal)}
                >
                  <FiCheckCircle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reject">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleReject(withdrawal)}
                >
                  <FiXCircle size={14} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Flex direction="column" gap="md" className={classes.container}>
      {/* Binance Balance Card */}
      {settingsData?.settings?.binanceEnabled && (
        <Paper p="md" shadow="xs" withBorder style={{ borderColor: '#F0B90B', borderWidth: 2 }}>
          <Group justify="space-between">
            <Group>
              <SiBinance size={32} color="#F0B90B" />
              <div>
                <Text size="sm" c="dimmed">Admin Binance Account Balance</Text>
                <Group gap="xs" align="baseline">
                  {binanceLoading ? (
                    <Loader size="sm" color="yellow" />
                  ) : binanceBalanceData?.connected ? (
                    <>
                      <Text size="xl" fw={700} c="#F0B90B">
                        {binanceBalanceData.balance?.free || '0.00'} {binanceBalanceData.currency || 'USDT'}
                      </Text>
                      {binanceBalanceData.balance?.locked && Number(binanceBalanceData.balance.locked) > 0 && (
                        <Text size="sm" c="dimmed">
                          (Locked: {binanceBalanceData.balance.locked})
                        </Text>
                      )}
                    </>
                  ) : (
                    <Text size="sm" c="red">Not Connected</Text>
                  )}
                </Group>
                <Text size="xs" c="dimmed">Network: {binanceBalanceData?.network || settingsData?.settings?.binanceNetwork || 'BSC'}</Text>
              </div>
            </Group>
            <Tooltip label="Refresh Balance">
              <ActionIcon 
                variant="light" 
                color="yellow" 
                size="lg" 
                onClick={() => refetchBinanceBalance()}
                loading={binanceLoading}
              >
                <FiRefreshCw size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>
      )}

      {/* Statistics */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{ background: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)" }}
          >
            <Group>
              <FiClock size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Pending Approval</Text>
                <Text size="xl" fw={700} c="white">{statistics.pendingCount || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{ background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" }}
          >
            <Group>
              <FiCheckCircle size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Completed</Text>
                <Text size="xl" fw={700} c="white">
                  ${statistics.completedAmountUSD?.toFixed(2) || "0.00"}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <Group>
              <FiDollarSign size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Total Requests</Text>
                <Text size="xl" fw={700} c="white">{statistics.totalCount || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{ background: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)" }}
          >
            <Group>
              <FiXCircle size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Failed/Rejected</Text>
                <Text size="xl" fw={700} c="white">
                  {(statistics.failedCount || 0) + (statistics.rejectedCount || 0)}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Header */}
      <Paper p="md" shadow="xs" className={classes.header}>
        <Group justify="space-between" mb="md">
          <Flex gap="xs" direction="column" align="flex-start">
            <Text size="xl" fw={700} className={classes.title}>
              USD Withdrawal Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Approve or reject USD withdrawals - Funds transfer via {currentMethod === 'binance' ? 'Binance (Crypto)' : 'Stripe'}
            </Text>
          </Flex>
          <Group>
            <Badge 
              color={settingsData?.settings?.binanceEnabled ? "green" : "gray"} 
              size="lg"
              leftSection={<SiBinance size={14} />}
            >
              Binance {settingsData?.settings?.binanceEnabled ? "ON" : "OFF"}
            </Badge>
            <Badge 
              color={settingsData?.settings?.stripeEnabled ? "green" : "gray"} 
              size="lg"
              leftSection={<FaStripe size={14} />}
            >
              Stripe {settingsData?.settings?.stripeEnabled ? "ON" : "OFF"}
            </Badge>
          </Group>
        </Group>

        {/* Filters */}
        <Group gap="md" className={classes.filters}>
          <TextInput
            placeholder="Search by user name or phone..."
            leftSection={<FiSearch />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActivePage(1);
            }}
            style={{ flex: 1 }}
            className={classes.searchInput}
          />
          <Select
            placeholder="Status"
            data={[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Rejected" },
              { value: "failed", label: "Failed" },
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value || "all")}
            style={{ width: 150 }}
          />
        </Group>
      </Paper>

      <Alert icon={currentMethod === 'binance' ? <SiBinance /> : <FaStripe />} color={currentMethod === 'binance' ? "yellow" : "violet"} variant="light">
        <Text size="sm" fw={500}>
          ⚠️ USD withdrawals require admin approval before processing via {currentMethod === 'binance' ? 'Binance (Crypto)' : 'Stripe'}.
        </Text>
        <Text size="xs" c="dimmed" mt="xs">
          {currentMethod === 'binance' 
            ? `When you approve a withdrawal, USDT will be transferred from your Binance account to the user's wallet address on ${settingsData?.settings?.binanceNetwork || 'BSC'} network.`
            : "When you approve a withdrawal, funds will be transferred from your platform's Stripe account to the user's connected Stripe account."}
          Make sure your platform has sufficient balance.
        </Text>
      </Alert>

      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1200}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">ID / Date</Table.Th>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Amount (USD)</Table.Th>
                <Table.Th ta="center">Amount (INR)</Table.Th>
                <Table.Th ta="center">Rate</Table.Th>
                <Table.Th ta="center">Method</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Transfer ID</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed" py="xl">
                      No USD withdrawals found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {pagination.totalPages > 1 && (
        <Flex justify="center">
          <Pagination
            value={activePage}
            onChange={setActivePage}
            total={pagination.totalPages}
          />
        </Flex>
      )}

      {/* Approve Modal */}
      <Modal
        opened={approveModal}
        onClose={() => setApproveModal(false)}
        title="Approve USD Withdrawal"
        centered
        size="lg"
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Alert 
              icon={selectedWithdrawal.withdrawalMethod === 'binance' ? <SiBinance /> : <FaStripe />} 
              color={selectedWithdrawal.withdrawalMethod === 'binance' ? "yellow" : "violet"} 
              title={selectedWithdrawal.withdrawalMethod === 'binance' ? "Binance Transfer Confirmation" : "Stripe Transfer Confirmation"}
            >
              <Text size="sm">
                Approving this withdrawal will <strong>immediately transfer funds</strong> 
                {selectedWithdrawal.withdrawalMethod === 'binance' 
                  ? ` (${settingsData?.settings?.binanceCurrency || 'USDT'}) from your Binance account to the user's wallet address.`
                  : " from your platform's Stripe account to the user's connected Stripe account."}
              </Text>
            </Alert>

            <Card withBorder p="md">
              <Flex align="center" gap="md" mb="md">
                <ThemeIcon size={60} radius="xl" color="green" variant="light">
                  <FiDollarSign size={30} />
                </ThemeIcon>
                <div>
                  <Text size="xl" fw={700} c="green">
                    ${selectedWithdrawal.amountUSD?.toFixed(2)} USD
                  </Text>
                  <Text size="sm" c="dimmed">
                    ≈ ₹{selectedWithdrawal.amountINR?.toFixed(2)} @ ₹{selectedWithdrawal.exchangeRate}/USD
                  </Text>
                </div>
              </Flex>

              <Divider my="sm" />

              <Grid>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">User</Text>
                  <Text size="sm" fw={500}>{selectedWithdrawal.userId?.name || "N/A"}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Phone</Text>
                  <Text size="sm">{selectedWithdrawal.userId?.phone || "N/A"}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Request ID</Text>
                  <Text size="xs" style={{ fontFamily: "monospace" }}>
                    {selectedWithdrawal._id}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Requested At</Text>
                  <Text size="sm">{formatDate(selectedWithdrawal.createdAt)}</Text>
                </Grid.Col>
                {selectedWithdrawal.withdrawalMethod === 'binance' && selectedWithdrawal.binanceWalletAddress && (
                  <>
                    <Grid.Col span={12}>
                      <Text size="xs" c="dimmed">Wallet Address</Text>
                      <Text size="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                        {selectedWithdrawal.binanceWalletAddress}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Network</Text>
                      <Badge color="yellow" size="sm">{selectedWithdrawal.binanceNetwork || 'BSC'}</Badge>
                    </Grid.Col>
                  </>
                )}
              </Grid>
            </Card>

            <Alert color="orange" variant="light" icon={<FiAlertCircle />}>
              <Text size="xs">
                <strong>Important:</strong> This action cannot be undone. Make sure your platform's Stripe account has sufficient balance to complete this transfer.
              </Text>
            </Alert>

            <Textarea
              label="Remarks (Optional)"
              placeholder="Any notes about this approval..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setApproveModal(false)}
                disabled={approveUSDWithdrawalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={confirmApprove}
                loading={approveUSDWithdrawalMutation.isPending}
                leftSection={selectedWithdrawal.withdrawalMethod === 'binance' ? <SiBinance /> : <FaStripe />}
              >
                {selectedWithdrawal.withdrawalMethod === 'binance' 
                  ? 'Approve & Transfer via Binance'
                  : 'Approve & Transfer via Stripe'}
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject USD Withdrawal"
        centered
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiXCircle />} color="red" title="Confirm Rejection">
              The amount will be refunded back to user's USD Wallet.
            </Alert>

            <Card withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">Amount</Text>
                <Text size="sm" fw={600} c="green">
                  ${selectedWithdrawal.amountUSD?.toFixed(2)} USD
                </Text>
              </Group>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">User</Text>
                <Text size="sm">{selectedWithdrawal.userId?.name}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Requested At</Text>
                <Text size="sm">{formatDate(selectedWithdrawal.createdAt)}</Text>
              </Group>
            </Card>

            <Textarea
              label="Rejection Reason *"
              placeholder="e.g., Suspicious activity, Verification needed..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setRejectModal(false)}
                disabled={rejectUSDWithdrawalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectUSDWithdrawalMutation.isPending}
                leftSection={<FiXCircle />}
              >
                Reject & Refund
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title="USD Withdrawal Details"
        centered
        size="lg"
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Card withBorder>
              <Text size="lg" fw={600} mb="sm">Transaction Details</Text>
              <Divider mb="sm" />
              <Grid>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Withdrawal ID</Text>
                  <Text size="sm" fw={500} style={{ fontFamily: "monospace" }}>
                    {selectedWithdrawal._id}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Status</Text>
                  {getStatusBadge(selectedWithdrawal.status)}
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Amount (USD)</Text>
                  <Text size="lg" fw={700} c="green">
                    ${selectedWithdrawal.amountUSD?.toFixed(2)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Amount (INR)</Text>
                  <Text size="lg" fw={600}>
                    ₹{selectedWithdrawal.amountINR?.toFixed(2)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Exchange Rate</Text>
                  <Text size="sm">₹{selectedWithdrawal.exchangeRate} / USD</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Created At</Text>
                  <Text size="sm">{formatDate(selectedWithdrawal.createdAt)}</Text>
                </Grid.Col>
              </Grid>
            </Card>

            <Card withBorder>
              <Text size="lg" fw={600} mb="sm">User Details</Text>
              <Divider mb="sm" />
              <Grid>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Name</Text>
                  <Text size="sm" fw={500}>
                    {selectedWithdrawal.userId?.name || "N/A"}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Phone</Text>
                  <Text size="sm">{selectedWithdrawal.userId?.phone || "N/A"}</Text>
                </Grid.Col>
              </Grid>
            </Card>

            {selectedWithdrawal.stripeTransferId && (
              <Card withBorder>
                <Text size="lg" fw={600} mb="sm">Stripe Details</Text>
                <Divider mb="sm" />
                <Grid>
                  <Grid.Col span={12}>
                    <Text size="xs" c="dimmed">Stripe Transfer ID</Text>
                    <Text size="sm" fw={500} style={{ fontFamily: "monospace" }}>
                      {selectedWithdrawal.stripeTransferId}
                    </Text>
                  </Grid.Col>
                  {selectedWithdrawal.stripePayoutStatus && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Payout Status</Text>
                      <Badge color="green" size="sm">
                        {selectedWithdrawal.stripePayoutStatus}
                      </Badge>
                    </Grid.Col>
                  )}
                  {selectedWithdrawal.processedAt && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Processed At</Text>
                      <Text size="sm">{formatDate(selectedWithdrawal.processedAt)}</Text>
                    </Grid.Col>
                  )}
                </Grid>
              </Card>
            )}

            {selectedWithdrawal.withdrawalMethod === 'binance' && (
              <Card withBorder>
                <Text size="lg" fw={600} mb="sm">
                  <SiBinance style={{ marginRight: 8 }} />
                  Binance Details
                </Text>
                <Divider mb="sm" />
                <Grid>
                  {selectedWithdrawal.binanceWalletAddress && (
                    <Grid.Col span={12}>
                      <Text size="xs" c="dimmed">Wallet Address</Text>
                      <Text size="sm" fw={500} style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                        {selectedWithdrawal.binanceWalletAddress}
                      </Text>
                    </Grid.Col>
                  )}
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">Network</Text>
                    <Badge color="yellow" size="sm">
                      {selectedWithdrawal.binanceNetwork || 'BSC'}
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">Currency</Text>
                    <Badge color="blue" size="sm">
                      {selectedWithdrawal.binanceCurrency || 'USDT'}
                    </Badge>
                  </Grid.Col>
                  {selectedWithdrawal.binanceStatus && (
                    <Grid.Col span={4}>
                      <Text size="xs" c="dimmed">Binance Status</Text>
                      <Badge color={selectedWithdrawal.binanceStatus === 'completed' ? 'green' : 'yellow'} size="sm">
                        {selectedWithdrawal.binanceStatus}
                      </Badge>
                    </Grid.Col>
                  )}
                  {selectedWithdrawal.binanceWithdrawId && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Withdraw ID</Text>
                      <Text size="xs" style={{ fontFamily: "monospace" }}>
                        {selectedWithdrawal.binanceWithdrawId}
                      </Text>
                    </Grid.Col>
                  )}
                  {selectedWithdrawal.binanceTxHash && (
                    <Grid.Col span={12}>
                      <Text size="xs" c="dimmed">Transaction Hash</Text>
                      <Text size="xs" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                        {selectedWithdrawal.binanceTxHash}
                      </Text>
                    </Grid.Col>
                  )}
                  {selectedWithdrawal.binanceFee && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Network Fee</Text>
                      <Text size="sm">{selectedWithdrawal.binanceFee} {selectedWithdrawal.binanceCurrency || 'USDT'}</Text>
                    </Grid.Col>
                  )}
                  {selectedWithdrawal.processedAt && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Processed At</Text>
                      <Text size="sm">{formatDate(selectedWithdrawal.processedAt)}</Text>
                    </Grid.Col>
                  )}
                </Grid>
              </Card>
            )}

            {selectedWithdrawal.adminRemarks && (
              <Card withBorder>
                <Text size="xs" c="dimmed">Admin Remarks</Text>
                <Text size="sm">{selectedWithdrawal.adminRemarks}</Text>
              </Card>
            )}

            {selectedWithdrawal.rejectionReason && (
              <Card withBorder bg="red.0">
                <Text size="xs" c="dimmed">Rejection Reason</Text>
                <Text size="sm" c="red">{selectedWithdrawal.rejectionReason}</Text>
              </Card>
            )}
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default USDWithdrawalManagement;
