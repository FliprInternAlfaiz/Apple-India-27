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
  PasswordInput,
  Avatar,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  NumberInput,
} from "@mantine/core";
import {
  FiSearch,
  FiKey,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiAlertCircle,
  FiUsers,
  FiTrendingUp,
  FiDollarSign,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllUsers,
  useResetPassword,
  useUpdateVerification,
  useUpdateAadhaar,
  useToggleStatus,
  useAddWalletAmount,
} from "../../hooks/query/useAdminUsers.query";
import classes from "./index.module.scss";

const AllUsers = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [aadhaarModal, setAadhaarModal] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Add these new modal states
  const [walletModal, setWalletModal] = useState(false);
  const [walletType, setWalletType] = useState<
    "mainWallet" | "commissionWallet"
  >("mainWallet");
  const [walletAmount, setWalletAmount] = useState<number>(0);

  // Fetch users with filters
  const { data, isLoading, error } = useAllUsers({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    verificationStatus: verificationFilter,
    userLevel: levelFilter,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Mutations
  const resetPasswordMutation = useResetPassword();
  const updateVerificationMutation = useUpdateVerification();
  const updateAadhaarMutation = useUpdateAadhaar();
  const toggleStatusMutation = useToggleStatus();
  const addWalletAmountMutation = useAddWalletAmount();

  const users = data?.users || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  // Handlers
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setResetPasswordModal(true);
    setNewPassword("");
  };

  const handleAddWallet = (user: any) => {
    setSelectedUser(user);
    setWalletModal(true);
    setWalletType("mainWallet");
    setWalletAmount(0);
  };

  const confirmAddWalletAmount = async () => {
    if (!walletAmount || walletAmount <= 0) {
      notifications.show({
        title: "Invalid Amount",
        message: "Amount must be greater than 0",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await addWalletAmountMutation.mutateAsync({
        userId: selectedUser._id,
        walletType,
        amount: walletAmount,
      });

      notifications.show({
        title: "Success",
        message: `₹${walletAmount} added to ${selectedUser.name}'s ${
          walletType === "mainWallet" ? "Prime Wallet" : "Task Wallet"
        }`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setWalletModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to add amount",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      notifications.show({
        title: "Invalid Password",
        message: "Password must be at least 6 characters",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        userId: selectedUser._id,
        newPassword,
      });

      notifications.show({
        title: "Success",
        message: `Password reset successful for ${selectedUser.name}`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setResetPasswordModal(false);
      setNewPassword("");
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to reset password",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const handleVerificationToggle = async (user: any) => {
    try {
      await updateVerificationMutation.mutateAsync({
        userId: user._id,
        isVerified: !user.isVerified,
      });

      notifications.show({
        title: "Success",
        message: `User verification ${
          !user.isVerified ? "enabled" : "disabled"
        }`,
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update verification status",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const handleAadhaarVerification = (user: any) => {
    setSelectedUser(user);
    setAadhaarModal(true);
    setAadhaarStatus("");
    setRejectionReason("");
  };

  const confirmAadhaarVerification = async () => {
    if (!aadhaarStatus) {
      notifications.show({
        title: "Invalid Selection",
        message: "Please select a verification status",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    if (aadhaarStatus === "rejected" && !rejectionReason) {
      notifications.show({
        title: "Rejection Reason Required",
        message: "Please provide a reason for rejection",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await updateAadhaarMutation.mutateAsync({
        userId: selectedUser._id,
        status: aadhaarStatus as any,
        rejectionReason:
          aadhaarStatus === "rejected" ? rejectionReason : undefined,
      });

      notifications.show({
        title: "Success",
        message: `Aadhaar verification ${aadhaarStatus}`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setAadhaarModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update Aadhaar verification",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      await toggleStatusMutation.mutateAsync({
        userId: user._id,
        isActive: !user.isActive,
      });

      notifications.show({
        title: "Success",
        message: `User ${!user.isActive ? "activated" : "deactivated"}`,
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update user status",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig: any = {
      approved: { color: "green", label: "Approved", icon: <FiCheckCircle /> },
      pending: { color: "yellow", label: "Pending", icon: <FiFilter /> },
      rejected: { color: "red", label: "Rejected", icon: <FiXCircle /> },
      not_submitted: {
        color: "gray",
        label: "Not Submitted",
        icon: <FiAlertCircle />,
      },
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge
        color={config.color}
        variant="light"
        leftSection={config.icon}
        size="sm"
      >
        {config.label}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load users. Please try again.
      </Alert>
    );
  }

  const rows = users.map((user: any) => (
    <Table.Tr key={user._id}>
      <Table.Td>
        <Flex justify="flex-start" gap="30" align="center">
          <Avatar src={user.picture} radius="xl" size="md">
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Flex justify="flex-start" align="flex-start" direction="column">
            <Text size="sm" fw={500}>
              {user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {user.phone}
            </Text>
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {user.levelName || "N/A"}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            user.teamLevel === "A"
              ? "green"
              : user.teamLevel === "B"
              ? "blue"
              : "orange"
          }
          size="sm"
        >
          Team {user.teamLevel}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Click to toggle">
          <Badge
            color={user.isVerified ? "green" : "red"}
            variant="light"
            style={{ cursor: "pointer" }}
            onClick={() => handleVerificationToggle(user)}
            size="sm"
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Click to manage">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => handleAadhaarVerification(user)}
          >
            {getVerificationBadge(user.aadhaarVerificationStatus)}
          </div>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹{user.mainWallet?.toLocaleString() || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label={user.plainPassword || "N/A"}>
          <Text size="xs" c="dimmed" style={{ cursor: "pointer" }}>
            {user.plainPassword ? user.plainPassword : "N/A"}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {user.totalReferrals || 0} / {user.directReferralsCount || 0}
        </Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Click to toggle">
          <Badge
            color={user.isActive ? "green" : "gray"}
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleStatus(user)}
            size="sm"
          >
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="light" color="blue" size="sm">
              <FiEye size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add Amount">
            <ActionIcon
              variant="light"
              color="green"
              size="sm"
              onClick={() => handleAddWallet(user)}
            >
              <FiDollarSign size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Reset Password">
            <ActionIcon
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleResetPassword(user)}
            >
              <FiKey size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Flex direction="column" gap="md" className={classes.container}>
      {/* Statistics */}
      <Group grow>
        <Paper
          p="md"
          shadow="xs"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Group>
            <FiUsers size={32} color="white" />
            <div>
              <Text size="xs" c="white" opacity={0.9}>
                Total Users
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.totalUsers || 0}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper
          p="md"
          shadow="xs"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          }}
        >
          <Group>
            <FiCheckCircle size={32} color="white" />
            <div>
              <Text size="xs" c="white" opacity={0.9}>
                Verified
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.verifiedUsers || 0}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper
          p="md"
          shadow="xs"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          <Group>
            <FiTrendingUp size={32} color="white" />
            <div>
              <Text size="xs" c="white" opacity={0.9}>
                Active
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.activeUsers || 0}
              </Text>
            </div>
          </Group>
        </Paper>
      </Group>

      {/* Header */}
      <Paper p="md" shadow="xs" className={classes.header}>
        <Group justify="space-between" mb="md">
          <Flex gap="xs" direction="column" align="flex-start">
            <Text size="xl" fw={700} className={classes.title}>
              User Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage all users and their permissions
            </Text>
          </Flex>
        </Group>

        {/* Filters */}
        <Group gap="md" className={classes.filters}>
          <TextInput
            placeholder="Search by name or phone..."
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
            placeholder="Verification Status"
            data={[
              { value: "all", label: "All Status" },
              { value: "verified", label: "Verified" },
              { value: "unverified", label: "Unverified" },
            ]}
            value={verificationFilter}
            onChange={(value) => {
              setVerificationFilter(value || "all");
              setActivePage(1);
            }}
            clearable
          />
          <Select
            placeholder="User Level"
            data={[
              { value: "all", label: "All Levels" },
              { value: "BASIC", label: "Basic" },
              { value: "REGULAR", label: "Regular" },
              { value: "VIP", label: "VIP" },
            ]}
            value={levelFilter}
            onChange={(value) => {
              setLevelFilter(value || "all");
              setActivePage(1);
            }}
            clearable
          />
        </Group>
      </Paper>

      {/* Table */}
      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1200}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Level</Table.Th>
                <Table.Th ta="center">Team</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Aadhaar</Table.Th>
                <Table.Th ta="center">Wallet</Table.Th>
                <Table.Th ta="center">Password</Table.Th>
                <Table.Th ta="center">Referrals</Table.Th>
                <Table.Th ta="center">Active</Table.Th>
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
                        Loading users...
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
                      No users found
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

      {/* Reset Password Modal */}
      <Modal
        opened={resetPasswordModal}
        onClose={() => setResetPasswordModal(false)}
        title="Reset User Password"
        centered
      >
        {selectedUser && (
          <Flex direction="column" gap="md">
            <Text size="sm" c="dimmed">
              Resetting password for: <strong>{selectedUser.name}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Phone: {selectedUser.phone}
            </Text>

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              description="Password must be at least 6 characters"
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setResetPasswordModal(false)}
                disabled={resetPasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="orange"
                onClick={confirmResetPassword}
                loading={resetPasswordMutation.isPending}
                leftSection={<FiKey />}
              >
                Reset Password
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      <Modal
        opened={walletModal}
        onClose={() => setWalletModal(false)}
        title="Add Amount to Wallet"
        centered
      >
        {selectedUser && (
          <Flex direction="column" gap="md">
            <Text size="sm" c="dimmed">
              User: <strong>{selectedUser.name}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Phone: {selectedUser.phone}
            </Text>

            <Flex gap="md" align="flex-end">
              <Paper p="sm" withBorder style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">
                  Prime Wallet
                </Text>
                <Text size="lg" fw={600}>
                  ₹{selectedUser.mainWallet?.toLocaleString() || 0}
                </Text>
              </Paper>
              <Paper p="sm" withBorder style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">
                  Task Wallet
                </Text>
                <Text size="lg" fw={600}>
                  ₹{selectedUser.taskWallet?.toLocaleString() || 0}
                </Text>
              </Paper>
            </Flex>

            <Select
              label="Select Wallet"
              placeholder="Choose wallet type"
              data={[
                { value: "mainWallet", label: "Prime Wallet" },
                { value: "commissionWallet", label: "Task Wallet" },
              ]}
              value={walletType}
              onChange={(value) =>
                setWalletType(value as "mainWallet" | "commissionWallet")
              }
              required
            />

            <NumberInput
              label="Amount"
              placeholder="Enter amount to add"
              value={walletAmount}
              onChange={(value) => setWalletAmount(Number(value))}
              min={0}
              step={100}
              prefix="₹"
              thousandSeparator=","
              required
              description="Enter the amount you want to add"
            />

            <Alert icon={<FiAlertCircle />} color="blue" variant="light">
              This will add ₹{walletAmount.toLocaleString()} to the selected
              wallet
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setWalletModal(false)}
                disabled={addWalletAmountMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={confirmAddWalletAmount}
                loading={addWalletAmountMutation.isPending}
                leftSection={<FiDollarSign />}
              >
                Add Amount
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* Aadhaar Verification Modal */}
      <Modal
        opened={aadhaarModal}
        onClose={() => setAadhaarModal(false)}
        title="Manage Aadhaar Verification"
        centered
      >
        {selectedUser && (
          <Flex direction="column" gap="md">
            <Text size="sm" c="dimmed">
              User: <strong>{selectedUser.name}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Current Status:{" "}
              {getVerificationBadge(selectedUser.aadhaarVerificationStatus)}
            </Text>

            <Select
              label="New Status"
              placeholder="Select status"
              data={[
                { value: "approved", label: "Approve" },
                { value: "rejected", label: "Reject" },
                { value: "pending", label: "Pending" },
              ]}
              value={aadhaarStatus}
              onChange={(value) => setAadhaarStatus(value || "")}
              required
            />

            {aadhaarStatus === "rejected" && (
              <TextInput
                label="Rejection Reason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            )}

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setAadhaarModal(false)}
                disabled={updateAadhaarMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={confirmAadhaarVerification}
                loading={updateAadhaarMutation.isPending}
              >
                Update Status
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default AllUsers;
