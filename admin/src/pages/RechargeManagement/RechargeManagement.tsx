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
  Image,
  Textarea,
  Card,
  Grid,
} from "@mantine/core";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiDollarSign,
  FiClock,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllRecharges,
  useApproveRecharge,
  useRejectRecharge,
  useRechargeStatistics,
} from "../../hooks/query/Recharges.query";
import classes from "./index.module.scss";

const RechargeManagement = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  // Fetch recharges
  const { data, isLoading, error } = useAllRecharges({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Fetch statistics
  const { data: statsData } = useRechargeStatistics();

  // Mutations
  const approveRechargeMutation = useApproveRecharge();
  const rejectRechargeMutation = useRejectRecharge();

  const recharges = data?.recharges || [];
  const pagination = data?.pagination || {};
  const statistics = statsData || {};

  // Handlers
  const handleApprove = (recharge: any) => {
    setSelectedRecharge(recharge);
    setRemarks("");
    setApproveModal(true);
  };

  const handleReject = (recharge: any) => {
    setSelectedRecharge(recharge);
    setRemarks("");
    setRejectModal(true);
  };

  const handleView = (recharge: any) => {
    setSelectedRecharge(recharge);
    setViewModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRecharge) return;

    try {
      await approveRechargeMutation.mutateAsync({
        orderId: selectedRecharge.orderId,
        remarks: remarks || "Payment verified successfully",
      });

      notifications.show({
        title: "Success",
        message: "Recharge approved successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setApproveModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to approve recharge",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmReject = async () => {
    if (!selectedRecharge) return;

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
      await rejectRechargeMutation.mutateAsync({
        orderId: selectedRecharge._id,
        remarks,
      });

      notifications.show({
        title: "Success",
        message: "Recharge rejected",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setRejectModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reject recharge",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load recharges. Please try again.
      </Alert>
    );
  }

  const rows = recharges.map((recharge: any) => (
    <Table.Tr key={recharge._id}>
      <Table.Td>
        <div>
          <Text size="sm" fw={500}>
            {recharge.orderId}
          </Text>
          <Text size="xs" c="dimmed">
            {formatDate(recharge.createdAt)}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <div>
          <Text size="sm" fw={500}>
            {recharge.userId?.name || "N/A"}
          </Text>
          <Text size="xs" c="dimmed">
            {recharge.userId?.phone || "N/A"}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="blue">
          ₹{recharge.amount}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{recharge.paymentDetails?.methodName || "N/A"}</Text>
        <Text size="xs" c="dimmed">
          {recharge.paymentDetails?.methodType || ""}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {recharge.transactionId || "Pending"}
        </Text>
      </Table.Td>
      <Table.Td>{getStatusBadge(recharge.status)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleView(recharge)}
            >
              <FiEye size={14} />
            </ActionIcon>
          </Tooltip>
          {recharge.status === "processing" && (
            <>
              <Tooltip label="Approve">
                <ActionIcon
                  variant="light"
                  color="green"
                  size="sm"
                  onClick={() => handleApprove(recharge)}
                >
                  <FiCheckCircle size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Reject">
                <ActionIcon
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => handleReject(recharge)}
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
                  Total Recharges
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
              Recharge Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage user recharge requests
            </Text>
          </Flex>
        </Group>

        {/* Filters */}
        <Group gap="md" className={classes.filters}>
          <TextInput
            placeholder="Search by order ID, name, or phone..."
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
        </Group>
      </Paper>

      {/* Table */}
      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1200}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">Order Details</Table.Th>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Amount</Table.Th>
                <Table.Th ta="center">Payment Method</Table.Th>
                <Table.Th ta="center">Transaction ID</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Flex
                      justify="center"
                      direction="column"
                      align="center"
                      py="xl"
                    >
                      <Loader size="lg" />
                      <Text c="dimmed" ml="sm">
                        Loading Recharge...
                      </Text>
                    </Flex>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length > 0 ? (
                rows
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed" py="xl">
                      No Recharge Data found
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
        title="Approve Recharge"
        centered
      >
        {selectedRecharge && (
          <Flex direction="column" gap="md">
            <Alert
              icon={<FiCheckCircle />}
              title="Confirm Approval"
              color="green"
            >
              This will add ₹{selectedRecharge.amount} to user's main wallet
            </Alert>

            <Card withBorder>
              <Text size="sm" fw={500}>
                Order: {selectedRecharge.orderId}
              </Text>
              <Text size="sm">Amount: ₹{selectedRecharge.amount}</Text>
              <Text size="sm">User: {selectedRecharge.userId?.name}</Text>
              <Text size="sm">
                Transaction: {selectedRecharge.transactionId}
              </Text>
            </Card>

            <Textarea
              label="Remarks (Optional)"
              placeholder="Payment verified successfully"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setApproveModal(false)}
                disabled={approveRechargeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={confirmApprove}
                loading={approveRechargeMutation.isPending}
                leftSection={<FiCheckCircle />}
              >
                Approve Recharge
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        opened={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Recharge"
        centered
      >
        {selectedRecharge && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiXCircle />} title="Confirm Rejection" color="red">
              This recharge request will be rejected
            </Alert>

            <Card withBorder>
              <Text size="sm" fw={500}>
                Order: {selectedRecharge.orderId}
              </Text>
              <Text size="sm">Amount: ₹{selectedRecharge.amount}</Text>
              <Text size="sm">User: {selectedRecharge.userId?.name}</Text>
            </Card>

            <Textarea
              label="Rejection Reason *"
              placeholder="e.g., Invalid transaction ID, Payment not received"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setRejectModal(false)}
                disabled={rejectRechargeMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmReject}
                loading={rejectRechargeMutation.isPending}
                leftSection={<FiXCircle />}
              >
                Reject Recharge
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title="Recharge Details"
        size="lg"
        centered
      >
        {selectedRecharge && (
          <Flex direction="column" gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Order Information
              </Text>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Order ID
                </Text>
                <Text size="sm" fw={500}>
                  {selectedRecharge.orderId}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Amount
                </Text>
                <Text size="sm" fw={600} c="blue">
                  ₹{selectedRecharge.amount}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Status
                </Text>
                {getStatusBadge(selectedRecharge.status)}
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Transaction ID
                </Text>
                <Text size="sm" fw={500}>
                  {selectedRecharge.transactionId || "N/A"}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Created At
                </Text>
                <Text size="sm">{formatDate(selectedRecharge.createdAt)}</Text>
              </Group>

              {selectedRecharge.submittedAt && (
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Submitted At
                  </Text>
                  <Text size="sm">
                    {formatDate(selectedRecharge.submittedAt)}
                  </Text>
                </Group>
              )}
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={600} mb="md">
                Payment Details
              </Text>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Method Name
                </Text>
                <Text size="sm" fw={500}>
                  {selectedRecharge.paymentDetails?.methodName}
                </Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  Method Type
                </Text>
                <Text size="sm">
                  {selectedRecharge.paymentDetails?.methodType}
                </Text>
              </Group>

              {selectedRecharge.paymentDetails?.upiId && (
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    UPI ID
                  </Text>
                  <Text size="sm">{selectedRecharge.paymentDetails.upiId}</Text>
                </Group>
              )}

              {selectedRecharge.paymentDetails?.accountNumber && (
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed">
                    Account Number
                  </Text>
                  <Text size="sm">
                    {selectedRecharge.paymentDetails.accountNumber}
                  </Text>
                </Group>
              )}
            </Card>

            {selectedRecharge.paymentProof && (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text size="lg" fw={600} mb="md">
                  Payment Proof
                </Text>
                <Image
                  src={selectedRecharge.paymentProof}
                  alt="Payment Proof"
                  radius="md"
                />
                <Button
                  component="a"
                  href={selectedRecharge.paymentProof}
                  target="_blank"
                  leftSection={<FiDownload />}
                  variant="light"
                  fullWidth
                  mt="md"
                >
                  Download Proof
                </Button>
              </Card>
            )}

            {selectedRecharge.remarks && (
              <Alert icon={<FiAlertCircle />} title="Remarks">
                {selectedRecharge.remarks}
              </Alert>
            )}
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default RechargeManagement;
