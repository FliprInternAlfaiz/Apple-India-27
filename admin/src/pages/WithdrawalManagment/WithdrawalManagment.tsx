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
  Button,
  Modal,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  Textarea,
  Card,
  Grid,
  CopyButton,
  Image,
} from "@mantine/core";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
  FiClock,
  FiEye,
  FiCopy,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
  useWithdrawalStatistics,
} from "../../hooks/query/Withdrawal.query";
import classes from "./index.module.scss";

const WithdrawalManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [walletFilter, setWalletFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [remarks, setRemarks] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const { data, isLoading, error } = useAllWithdrawals({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
    walletType: walletFilter !== "all" ? walletFilter : undefined,
  });

  const { data: statsData } = useWithdrawalStatistics();
  const approveWithdrawalMutation = useApproveWithdrawal();
  const rejectWithdrawalMutation = useRejectWithdrawal();

  const withdrawals = data?.withdrawals || [];
  const pagination = data?.pagination || {};
  const statistics = statsData || {};

  const handleApprove = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setTransactionId("");
    setApproveModal(true);
  };

  const handleReject = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setRemarks("");
    setRejectModal(true);
  };

  const handleView = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setViewModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return;

    if (!transactionId) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter transaction ID",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await approveWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        transactionId,
        remarks: remarks || "Payment processed successfully",
      });

      notifications.show({
        title: "Success",
        message: "Withdrawal approved successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setApproveModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.message || "Failed to approve withdrawal",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedWithdrawal) return;

    if (!remarks) {
      notifications.show({
        title: "Validation Error",
        message: "Please provide rejection reason",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await rejectWithdrawalMutation.mutateAsync({
        withdrawalId: selectedWithdrawal._id,
        remarks,
      });

      notifications.show({
        title: "Success",
        message: "Withdrawal rejected",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setRejectModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject withdrawal",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: "yellow",
      processing: "blue",
      completed: "green",
      rejected: "red",
    };
    return (
      <Badge color={colors[status] || "gray"} size="sm">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getWalletBadge = (walletType: string) => {
    return (
      <Badge color={walletType === "mainWallet" ? "blue" : "green"} size="sm">
        {walletType === "mainWallet" ? "Main" : "Commission"}
      </Badge>
    );
  };

  const getAccountTypeBadge = (accountType: string) => {
    const colors: any = {
      savings: "blue",
      current: "cyan",
      qr: "violet",
    };
    const labels: any = {
      savings: "Savings",
      current: "Current",
      qr: "QR Code",
    };
    return (
      <Badge color={colors[accountType] || "gray"} size="sm">
        {labels[accountType] || accountType}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
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
        Failed to load withdrawals. Please try again.
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
        <Text size="sm" fw={600} c="blue">
          ₹{withdrawal.amount}
        </Text>
      </Table.Td>
      <Table.Td>{getWalletBadge(withdrawal.walletType)}</Table.Td>
      <Table.Td>
        <div>
          <Text size="sm">{withdrawal.bankName}</Text>
          {withdrawal.accountType === 'qr' ? (
            <Badge size="xs" color="violet">QR Payment</Badge>
          ) : (
            <Text size="xs" c="dimmed">
              ••••{withdrawal.accountNumber?.slice(-4)}
            </Text>
          )}
        </div>
      </Table.Td>
      <Table.Td>{getAccountTypeBadge(withdrawal.accountType)}</Table.Td>
      <Table.Td>{getStatusBadge(withdrawal.status)}</Table.Td>
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
              <Tooltip label="Approve">
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
      {/* Statistics */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" shadow="xs" className={classes.statsCard}>
            <Group>
              <FiDollarSign size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  Total Withdrawals
                </Text>
                <Text size="xl" fw={700} c="white">
                  ₹{statistics.totalAmount || 0}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            }}
          >
            <Group>
              <FiClock size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  Pending
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.pendingCount || 0}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            }}
          >
            <Group>
              <FiCheckCircle size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  Completed
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.completedCount || 0}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper
            p="md"
            shadow="xs"
            style={{
              background: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
            }}
          >
            <Group>
              <FiXCircle size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  Rejected
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.rejectedCount || 0}
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
              Withdrawal Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage user withdrawal requests
            </Text>
          </Flex>
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
              { value: "processing", label: "Processing" },
              { value: "completed", label: "Completed" },
              { value: "rejected", label: "Rejected" },
            ]}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value || "all");
              setActivePage(1);
            }}
            clearable
          />
          <Select
            placeholder="Wallet Type"
            data={[
              { value: "all", label: "All Wallets" },
              { value: "mainWallet", label: "Main Wallet" },
              { value: "commissionWallet", label: "Commission Wallet" },
            ]}
            value={walletFilter}
            onChange={(value) => {
              setWalletFilter(value || "all");
              setActivePage(1);
            }}
            clearable
          />
        </Group>
      </Paper>

      {/* Table */}
      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1200}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">Request ID</Table.Th>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Amount</Table.Th>
                <Table.Th ta="center">Wallet Type</Table.Th>
                <Table.Th ta="center">Payment Details</Table.Th>
                <Table.Th ta="center">Method</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Flex
                      justify="center"
                      direction="column"
                      align="center"
                      py="xl"
                    >
                      <Loader size="lg" />
                      <Text c="dimmed" ml="sm">
                        Loading Withdrawal Data...
                      </Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text ta="center" c="dimmed" py="xl">
                      No Withdrawal Data found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Group justify="center" p="md" className={classes.pagination}>
            <Pagination
              value={activePage}
              onChange={setActivePage}
              total={pagination.totalPages}
            />
          </Group>
        )}
      </Paper>

      {/* Approve Modal */}
      <Modal
        opened={approveModal}
        onClose={() => setApproveModal(false)}
        title="Approve Withdrawal"
        centered
        size="lg"
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Alert
              icon={<FiCheckCircle />}
              title="Confirm Approval"
              color="green"
            >
              Process payment to user's {selectedWithdrawal.accountType === 'qr' ? 'QR code' : 'bank account'}
            </Alert>

            <Card withBorder>
              <Text size="sm" fw={500} mb="xs">
                Payment Details:
              </Text>

              {selectedWithdrawal.accountType === 'qr' && selectedWithdrawal.qrCodeImage && (
                <Card withBorder p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
                  <Text size="sm" fw={600} mb="sm" ta="center">
                    Scan QR Code to Pay
                  </Text>
                  <Flex justify="center" mb="sm">
                    <Image
                      src={`${process.env.REACT_APP_API_URL}/${selectedWithdrawal.qrCodeImage}`}
                      alt="Payment QR Code"
                      width={250}
                      height={250}
                      radius="md"
                    />
                  </Flex>
                  <Alert color="blue" icon={<FiAlertCircle />}>
                    <Text size="xs">
                      Scan this QR code using any UPI app to make the payment. After successful payment, enter the transaction ID below.
                    </Text>
                  </Alert>
                </Card>
              )}

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Account Holder
                </Text>
                <Text size="sm">{selectedWithdrawal.accountHolderName}</Text>
              </Group>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  {selectedWithdrawal.accountType === 'qr' ? 'Payment Name' : 'Bank Name'}
                </Text>
                <Text size="sm">{selectedWithdrawal.bankName}</Text>
              </Group>
              
              {selectedWithdrawal.accountType !== 'qr' && (
                <>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      Account Number
                    </Text>
                    <Group gap="xs">
                      <Text size="sm">{selectedWithdrawal.accountNumber}</Text>
                      <CopyButton value={selectedWithdrawal.accountNumber}>
                        {({ copied, copy }) => (
                          <ActionIcon
                            color={copied ? "teal" : "gray"}
                            onClick={copy}
                            size="sm"
                          >
                            <FiCopy size={12} />
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                  </Group>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="dimmed">
                      IFSC Code
                    </Text>
                    <Group gap="xs">
                      <Text size="sm">{selectedWithdrawal.ifscCode}</Text>
                      <CopyButton value={selectedWithdrawal.ifscCode}>
                        {({ copied, copy }) => (
                          <ActionIcon
                            color={copied ? "teal" : "gray"}
                            onClick={copy}
                            size="sm"
                          >
                            <FiCopy size={12} />
                          </ActionIcon>
                        )}
                      </CopyButton>
                    </Group>
                  </Group>
                </>
              )}
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Amount
                </Text>
                <Text size="sm" fw={600} c="blue">
                  ₹{selectedWithdrawal.amount}
                </Text>
              </Group>
            </Card>

            <TextInput
              label="Transaction ID *"
              placeholder="Enter transaction ID"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />

            <Textarea
              label="Remarks (Optional)"
              placeholder="Payment processed successfully"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setApproveModal(false)}
                disabled={approveWithdrawalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={confirmApprove}
                loading={approveWithdrawalMutation.isPending}
                leftSection={<FiCheckCircle />}
              >
                Approve Withdrawal
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Withdrawal"
        centered
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiXCircle />} title="Confirm Rejection" color="red">
              Amount will be refunded to user's wallet
            </Alert>

            <Card withBorder>
              <Text size="sm" fw={500}>
                Request Details
              </Text>
              <Text size="sm">Amount: ₹{selectedWithdrawal.amount}</Text>
              <Text size="sm">User: {selectedWithdrawal.userId?.name}</Text>
              <Text size="sm">
                Wallet:{" "}
                {selectedWithdrawal.walletType === "mainWallet"
                  ? "Main"
                  : "Commission"}
              </Text>
              <Text size="sm">
                Method: {selectedWithdrawal.accountType === 'qr' ? 'QR Payment' : 'Bank Transfer'}
              </Text>
            </Card>

            <Textarea
              label="Rejection Reason *"
              placeholder="e.g., Invalid details, Technical issue"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setRejectModal(false)}
                disabled={rejectWithdrawalMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectWithdrawalMutation.isPending}
                leftSection={<FiXCircle />}
              >
                Reject Withdrawal
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title="Withdrawal Details"
        size="lg"
        centered
      >
        {selectedWithdrawal && (
          <Flex direction="column" gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Request Information
              </Text>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Request ID
                </Text>
                <Text size="sm" fw={500}>
                  {selectedWithdrawal._id.slice(-12)}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Amount
                </Text>
                <Text size="sm" fw={600} c="blue">
                  ₹{selectedWithdrawal.amount}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Wallet Type
                </Text>
                {getWalletBadge(selectedWithdrawal.walletType)}
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Payment Method
                </Text>
                {getAccountTypeBadge(selectedWithdrawal.accountType)}
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Status
                </Text>
                {getStatusBadge(selectedWithdrawal.status)}
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Created At
                </Text>
                <Text size="sm">
                  {formatDate(selectedWithdrawal.createdAt)}
                </Text>
              </Group>

              {selectedWithdrawal.completedAt && (
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Completed At
                  </Text>
                  <Text size="sm">
                    {formatDate(selectedWithdrawal.completedAt)}
                  </Text>
                </Group>
              )}
            </Card>

            {selectedWithdrawal.accountType === 'qr' && selectedWithdrawal.qrCodeImage ? (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">
                  QR Code Payment Details
                </Text>
                
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Payment Name
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedWithdrawal.accountHolderName}
                  </Text>
                </Group>

                <Group justify="space-between" mb="md">
                  <Text size="sm" c="dimmed">
                    UPI Details
                  </Text>
                  <Text size="sm">{selectedWithdrawal.bankName}</Text>
                </Group>

                <Text size="sm" fw={500} mb="sm" ta="center">QR Code:</Text>
                <Flex justify="center">
                  <Image
                    src={`${process.env.REACT_APP_API_URL}/${selectedWithdrawal.qrCodeImage}`}
                    alt="Payment QR Code"
                    width={200}
                    height={200}
                    radius="md"
                  />
                </Flex>
              </Card>
            ) : (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">
                  Bank Details
                </Text>

                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Account Holder
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedWithdrawal.accountHolderName}
                  </Text>
                </Group>

                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Bank Name
                  </Text>
                  <Text size="sm">{selectedWithdrawal.bankName}</Text>
                </Group>

                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Account Number
                  </Text>
                  <Text size="sm">{selectedWithdrawal.accountNumber}</Text>
                </Group>

                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    IFSC Code
                  </Text>
                  <Text size="sm">{selectedWithdrawal.ifscCode}</Text>
                </Group>
              </Card>
            )}

            {selectedWithdrawal.transactionId && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Transaction ID
                  </Text>
                  <Text size="sm" fw={500}>
                    {selectedWithdrawal.transactionId}
                  </Text>
                </Group>
              </Card>
            )}

            {selectedWithdrawal.remarks && (
              <Alert icon={<FiAlertCircle />} title="Remarks">
                {selectedWithdrawal.remarks}
              </Alert>
            )}
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default WithdrawalManagement;