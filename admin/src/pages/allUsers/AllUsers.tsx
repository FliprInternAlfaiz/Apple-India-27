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
  Textarea,
  SegmentedControl,
  Switch,
  Card,
  Divider,
  Grid,
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
  FiMinus,
  FiPlus,
  FiDollarSign,
  FiArrowDownCircle,
  FiArrowRight,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllUsers,
  useResetPassword,
  useUpdateVerification,
  useUpdateAadhaar,
  useToggleStatus,
  useAddWalletAmount,
  useDeductWalletAmount,
  useUpdateLevel,
} from "../../hooks/query/useAdminUsers.query";
import {
  useToggleUSDUser,
  useFundUSDWallet,
  useUSDWalletByUser,
} from "../../hooks/query/USDWithdrawal.query";
import { useAllLevels } from "../../hooks/query/level.query";
import classes from "./index.module.scss";

interface Level {
  _id: string;
  levelNumber: number;
  levelName: string;
  rewardPerTask: number;
  dailyTaskLimit: number;
}

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
  const [downgradeModal, setDowngradeModal] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  // Wallet modal states
  const [walletModal, setWalletModal] = useState(false);
  const [walletAction, setWalletAction] = useState<"add" | "deduct">("add");
  const [walletType, setWalletType] = useState<"mainWallet" | "commissionWallet">("mainWallet");
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [deductReason, setDeductReason] = useState("");

  // USD Wallet modal states
  const [usdWalletModal, setUsdWalletModal] = useState(false);
  const [usdFundAmount, setUsdFundAmount] = useState<number>(0);
  const [usdFundDescription, setUsdFundDescription] = useState("");

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
  const deductWalletAmountMutation = useDeductWalletAmount();
  const toggleUSDUserMutation = useToggleUSDUser();
  const fundUSDWalletMutation = useFundUSDWallet();
  const updateLevelMutation = useUpdateLevel();

  // Fetch all levels
  const { data: levelsData } = useAllLevels({ isActive: true });
  const allLevels = levelsData?.levels || [];

  // Fetch USD wallet when user is selected
  const { data: usdWalletData } = useUSDWalletByUser(selectedUser?._id || "");

  const users = data?.users || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  // Handlers
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setResetPasswordModal(true);
    setNewPassword("");
  };

  const handleWalletAction = (user: any, action: "add" | "deduct") => {
    setSelectedUser(user);
    setWalletAction(action);
    setWalletModal(true);
    setWalletType("mainWallet");
    setWalletAmount(0);
    setDeductReason("");
  };

  // USD User Toggle Handler
  const handleToggleUSDUser = async (user: any) => {
    try {
      await toggleUSDUserMutation.mutateAsync({
        userId: user._id,
        isUSDUser: !user.isUSDUser,
      });

      notifications.show({
        title: "Success",
        message: `User ${!user.isUSDUser ? "enabled" : "disabled"} for USD withdrawals`,
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to update USD status",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  // USD Wallet Modal Handler
  const handleOpenUSDWalletModal = (user: any) => {
    setSelectedUser(user);
    setUsdFundAmount(0);
    setUsdFundDescription("");
    setUsdWalletModal(true);
  };

  // Fund USD Wallet Handler
  const confirmFundUSDWallet = async () => {
    if (!usdFundAmount || usdFundAmount <= 0) {
      notifications.show({
        title: "Invalid Amount",
        message: "Amount must be greater than 0",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      await fundUSDWalletMutation.mutateAsync({
        userId: selectedUser._id,
        amountINR: usdFundAmount,
        description: usdFundDescription || "Admin wallet funding",
      });

      notifications.show({
        title: "Success",
        message: `₹${usdFundAmount} funded to ${selectedUser.name}'s USD wallet`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setUsdWalletModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to fund USD wallet",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmWalletAction = async () => {
    if (!walletAmount || walletAmount <= 0) {
      notifications.show({
        title: "Invalid Amount",
        message: "Amount must be greater than 0",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    if (walletAction === "deduct" && !deductReason.trim()) {
      notifications.show({
        title: "Reason Required",
        message: "Please provide a reason for deduction",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    try {
      if (walletAction === "add") {
        await addWalletAmountMutation.mutateAsync({
          userId: selectedUser._id,
          walletType,
          amount: walletAmount,
        });

        notifications.show({
          title: "Success",
          message: `₹${walletAmount} added to ${selectedUser.name}'s ${walletType === "mainWallet" ? "Prime Wallet" : "Task Wallet"
            }`,
          color: "green",
          icon: <FiCheckCircle />,
        });
      } else {
        await deductWalletAmountMutation.mutateAsync({
          userId: selectedUser._id,
          walletType,
          amount: walletAmount,
          reason: deductReason,
        });

        notifications.show({
          title: "Success",
          message: `₹${walletAmount} deducted from ${selectedUser.name}'s ${walletType === "mainWallet" ? "Prime Wallet" : "Task Wallet"
            }`,
          color: "green",
          icon: <FiCheckCircle />,
        });
      }

      setWalletModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || `Failed to ${walletAction} amount`,
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

  const handleDowngrade = (user: any) => {
    setSelectedUser(user);
    setSelectedLevelId(null);
    setDowngradeModal(true);
  };

  const confirmDowngrade = async () => {
    if (!selectedLevelId) {
      notifications.show({
        title: "Selection Required",
        message: "Please select a level to downgrade to",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    const targetLevel = allLevels.find((l: Level) => l._id === selectedLevelId);
    if (!targetLevel) return;

    try {
      await updateLevelMutation.mutateAsync({
        userId: selectedUser._id,
        userLevel: targetLevel.levelNumber,
        currentLevel: targetLevel.levelName,
        levelName: targetLevel.levelName,
      });

      notifications.show({
        title: "Success",
        message: `User level downgraded successfully to ${targetLevel.levelName}`,
        color: "green",
        icon: <FiCheckCircle />,
      });

      setDowngradeModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to downgrade level",
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
        message: `User verification ${!user.isVerified ? "enabled" : "disabled"}`,
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
        rejectionReason: aadhaarStatus === "rejected" ? rejectionReason : undefined,
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
      not_submitted: { color: "gray", label: "Not Submitted", icon: <FiAlertCircle /> },
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge color={config.color} variant="light" leftSection={config.icon} size="sm">
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
            user.teamLevel === "A" ? "green" : user.teamLevel === "B" ? "blue" : "orange"
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
          <div style={{ cursor: "pointer" }} onClick={() => handleAadhaarVerification(user)}>
            {getVerificationBadge(user.aadhaarVerificationStatus)}
          </div>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹{user.mainWallet?.toLocaleString() || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">₹{user.commissionWallet?.toLocaleString() || 0}</Text>
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
        <Flex gap="xs" align="center">
          <Tooltip label={user.isUSDUser ? "Disable USD" : "Enable USD"}>
            <Switch
              checked={user.isUSDUser || false}
              onChange={() => handleToggleUSDUser(user)}
              size="xs"
              color="green"
            />
          </Tooltip>
          {user.isUSDUser && (
            <Tooltip label="Fund USD Wallet">
              <ActionIcon
                variant="light"
                color="green"
                size="xs"
                onClick={() => handleOpenUSDWalletModal(user)}
              >
                <FiDollarSign size={12} />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      </Table.Td>
      <Table.Td ta="center">
        <Tooltip label="Downgrade Level">
          <ActionIcon
            variant="light"
            color="grape"
            size="md"
            onClick={() => handleDowngrade(user)}
            radius="md"
          >
            <FiArrowDownCircle size={16} />
          </ActionIcon>
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
              onClick={() => handleWalletAction(user, "add")}
            >
              <FiPlus size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Deduct Amount">
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => handleWalletAction(user, "deduct")}
            >
              <FiMinus size={14} />
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
        <Table.ScrollContainer minWidth={1300}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">User</Table.Th>
                <Table.Th ta="center">Level</Table.Th>
                <Table.Th ta="center">Team</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Aadhaar</Table.Th>
                <Table.Th ta="center">Prime Wallet</Table.Th>
                <Table.Th ta="center">Task Wallet</Table.Th>
                <Table.Th ta="center">Password</Table.Th>
                <Table.Th ta="center">Referrals</Table.Th>
                <Table.Th ta="center">Active</Table.Th>
                <Table.Th ta="center">USD User</Table.Th>
                <Table.Th ta="center">Downgrade</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={13}>
                    <Flex justify="center" direction="column" align="center" py="xl">
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
                  <Table.Td colSpan={13}>
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

      {/* Wallet Action Modal (Add/Deduct) */}
      <Modal
        opened={walletModal}
        onClose={() => setWalletModal(false)}
        title={`${walletAction === "add" ? "Add" : "Deduct"} Amount ${walletAction === "add" ? "to" : "from"
          } Wallet`}
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
                  ₹{selectedUser.commissionWallet?.toLocaleString() || 0}
                </Text>
              </Paper>
            </Flex>

            <SegmentedControl
              value={walletAction}
              onChange={(value) => setWalletAction(value as "add" | "deduct")}
              data={[
                { label: "Add Amount", value: "add" },
                { label: "Deduct Amount", value: "deduct" },
              ]}
              fullWidth
              color={walletAction === "add" ? "green" : "red"}
            />

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
              placeholder={`Enter amount to ${walletAction}`}
              value={walletAmount}
              onChange={(value) => setWalletAmount(Number(value))}
              min={0}
              step={100}
              prefix="₹"
              thousandSeparator=","
              required
              description={`Enter the amount you want to ${walletAction}`}
            />

            {walletAction === "deduct" && (
              <Textarea
                label="Reason for Deduction"
                placeholder="Enter reason (required)"
                value={deductReason}
                onChange={(e) => setDeductReason(e.target.value)}
                required
                minRows={3}
                description="This will be recorded for audit purposes"
              />
            )}

            <Alert
              icon={<FiAlertCircle />}
              color={walletAction === "add" ? "blue" : "orange"}
              variant="light"
            >
              This will {walletAction} ₹{walletAmount.toLocaleString()}{" "}
              {walletAction === "add" ? "to" : "from"} the selected wallet
            </Alert>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                onClick={() => setWalletModal(false)}
                disabled={
                  addWalletAmountMutation.isPending ||
                  deductWalletAmountMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                color={walletAction === "add" ? "green" : "red"}
                onClick={confirmWalletAction}
                loading={
                  walletAction === "add"
                    ? addWalletAmountMutation.isPending
                    : deductWalletAmountMutation.isPending
                }
                leftSection={
                  walletAction === "add" ? <FiPlus /> : <FiMinus />
                }
              >
                {walletAction === "add" ? "Add" : "Deduct"} Amount
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
              Current Status: {getVerificationBadge(selectedUser.aadhaarVerificationStatus)}
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

      <Modal
        opened={downgradeModal}
        onClose={() => setDowngradeModal(false)}
        title="User Account Demotion"
        centered
        size="lg"
        radius="lg"
        className={classes.professionalModal}
      >
        {selectedUser && (() => {
          const lowerLevels = allLevels
            .filter((l: Level) => l.levelNumber < (selectedUser.currentLevelNumber ?? 999))
            .sort((a: Level, b: Level) => b.levelNumber - a.levelNumber);

          const currentUserLevel = allLevels.find(
            (l: Level) => l.levelNumber === selectedUser.currentLevelNumber
          );

          return (
            <Flex direction="column">
              <div className={classes.headerSection}>
                <Group justify="space-between" align="center">
                  <div>
                    <Text size="lg" fw={800} c="dark.6" style={{ lineHeight: 1.2 }}>
                      {selectedUser.name}
                    </Text>
                    <Text size="xs" c="dimmed" mt={2}>ACCNT REF: <Text span fw={700} c="dark.2">{selectedUser._id?.slice(-12).toUpperCase()}</Text></Text>
                  </div>
                  <Badge size="lg" radius="md" color="blue" variant="light" h={36} px="md">
                    Ph: {selectedUser.phone}
                  </Badge>
                </Group>
              </div>

              <div className={classes.comparisonSection}>
                <div className={`${classes.statCard} ${classes.current}`}>
                  <h4>Active Level</h4>
                  <Text className={classes.rankTitle}>{selectedUser.levelName || "BASIC"}</Text>
                  <Badge size="xs" variant="filled" color="blue" radius="sm">LEVEL {selectedUser.currentLevelNumber ?? "0"}</Badge>

                  <div className={classes.metricGrid}>
                    <div className={classes.metricItem}>
                      <span className={classes.label}>Commission</span>
                      <span className={classes.value}>₹{currentUserLevel?.rewardPerTask ?? selectedUser.rewardPerTask ?? "0.00"}</span>
                    </div>
                    <div className={classes.metricItem}>
                      <span className={classes.label}>Daily Capacity</span>
                      <span className={classes.value}>{currentUserLevel?.dailyTaskLimit ?? selectedUser.dailyTaskLimit ?? "0"} <Text span size="xs" fw={500}>TPS</Text></span>
                    </div>
                  </div>
                </div>

                <div className={classes.arrowIcon}>
                  <FiArrowRight size={24} />
                </div>

                <div className={`${classes.statCard} ${classes.target}`}>
                  <h4>Target Level</h4>
                  {lowerLevels.length > 0 ? (
                    <>
                      <Select
                        placeholder="Assign New Level"
                        data={lowerLevels.map((l: Level) => ({ value: l._id, label: l.levelName }))}
                        value={selectedLevelId}
                        onChange={setSelectedLevelId}
                        variant="filled"
                        radius="md"
                        size="sm"
                      />

                      {selectedLevelId ? (
                        <>
                          <Badge size="xs" variant="dot" color="pink" radius="sm">
                            NEW LEVEL- {allLevels.find((l: Level) => l._id === selectedLevelId)?.levelNumber}
                          </Badge>
                          <div className={classes.metricGrid}>
                            <div className={classes.metricItem}>
                              <span className={classes.label}>New Payout</span>
                              <span className={classes.value}>₹{allLevels.find((l: Level) => l._id === selectedLevelId)?.rewardPerTask}</span>
                            </div>
                            <div className={classes.metricItem}>
                              <span className={classes.label}>New Quota</span>
                              <span className={classes.value}>{allLevels.find((l: Level) => l._id === selectedLevelId)?.dailyTaskLimit} <Text span size="xs" fw={500}>TPS</Text></span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Flex h={80} justify="center" align="center">
                          <Text size="xs" c="dimmed" ta="center" px="xl">Assign target level to visualize potential revenue impact</Text>
                        </Flex>
                      )}
                    </>
                  ) : (
                    <Flex h="100%" direction="column" justify="center" align="center" py="xl">
                      <FiArrowDownCircle size={32} color="#dee2e6" style={{ marginBottom: '1rem' }} />
                      <Text size="sm" fw={700} c="red.6" ta="center">No Lower Level Available</Text>
                      <Text size="xs" c="dimmed" ta="center" mt={4}>This user is already at the base level.</Text>
                    </Flex>
                  )}
                </div>
              </div>

              <Alert
                icon={<FiAlertCircle size={20} />}
                color="red"
                className={classes.dangerAlert}
                title="Irreversible Level Modification"
                mb="lg"
              >
                Downgrading level overrides active investment benefits. Financial metrics and user quota will be purged and re-allocated immediately.
              </Alert>

              <Group justify="flex-end" className={classes.footerActions} gap="sm">
                <Button
                  variant="subtle"
                  className={`${classes.actionButton} ${classes.secondary}`}
                  onClick={() => setDowngradeModal(false)}
                  size="sm"
                >
                  Cancel Override
                </Button>
                <Button
                  className={`${classes.actionButton} ${classes.primary}`}
                  onClick={confirmDowngrade}
                  loading={updateLevelMutation.isPending}
                  leftSection={<FiArrowDownCircle size={16} />}
                  disabled={!selectedLevelId}
                  size="sm"
                >
                  Commit Demotion
                </Button>
              </Group>
            </Flex>
          );
        })()}
      </Modal>

      <Modal
        opened={usdWalletModal}
        onClose={() => setUsdWalletModal(false)}
        title="Fund USD Wallet"
        centered
        size="lg"
      >
        {selectedUser && (
          <Flex direction="column" gap="md">
            <Card withBorder>
              <Text size="lg" fw={600} mb="sm">
                User Information
              </Text>
              <Divider mb="sm" />
              <Grid>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Name</Text>
                  <Text size="sm" fw={500}>{selectedUser.name}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">Phone</Text>
                  <Text size="sm">{selectedUser.phone}</Text>
                </Grid.Col>
              </Grid>
            </Card>

            {usdWalletData?.wallet && (
              <Card withBorder>
                <Text size="lg" fw={600} mb="sm">
                  Current USD Wallet Balance
                </Text>
                <Divider mb="sm" />
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Balance (INR)</Text>
                    <Text size="lg" fw={600}>
                      ₹{usdWalletData.wallet.balanceINR?.toLocaleString() || 0}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Balance (USD)</Text>
                    <Text size="lg" fw={600} c="green">
                      ${usdWalletData.wallet.balanceUSD?.toFixed(2) || "0.00"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Total Funded</Text>
                    <Text size="sm">
                      ₹{usdWalletData.wallet.totalFundedINR?.toLocaleString() || 0}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed">Exchange Rate</Text>
                    <Text size="sm">
                      1 USD = ₹{usdWalletData.currentExchangeRate || 83}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>
            )}

            <NumberInput
              label="Amount to Fund (INR)"
              placeholder="Enter amount in INR"
              value={usdFundAmount}
              onChange={(value) => setUsdFundAmount(Number(value))}
              min={0}
              step={1000}
              prefix="₹"
              thousandSeparator=","
              required
              description="This amount will be credited to user's USD wallet"
            />

            {usdFundAmount > 0 && (
              <Alert icon={<FiDollarSign />} color="green" variant="light">
                Equivalent USD: $
                {(usdFundAmount / (usdWalletData?.currentExchangeRate || 83)).toFixed(2)}
              </Alert>
            )}

            <Textarea
              label="Description (Optional)"
              placeholder="e.g., Monthly salary, Task reward, etc."
              value={usdFundDescription}
              onChange={(e) => setUsdFundDescription(e.target.value)}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setUsdWalletModal(false)}
                disabled={fundUSDWalletMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="green"
                onClick={confirmFundUSDWallet}
                loading={fundUSDWalletMutation.isPending}
                leftSection={<FiDollarSign />}
              >
                Fund USD Wallet
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default AllUsers;