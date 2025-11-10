// pages/admin/TeamManagement.tsx
import React, { useState } from "react";
import {
  Text,
  Group,
  Flex,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Select,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  Avatar,
  Card,
  Grid,
  Tabs,
} from "@mantine/core";
import {
  FiSearch,
  FiUsers,
  FiAlertCircle,
  FiTrendingUp,
  FiEye,
  FiAward,
  FiUserCheck,
} from "react-icons/fi";
import {
  useAllTeamReferrals,
  useTeamStatistics,
} from "../../hooks/query/team.query";
import classes from "./index.module.scss";

const TeamManagement = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [activePage, setActivePage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const itemsPerPage = 10;

  // Fetch team data
  const { data, isLoading, error } = useAllTeamReferrals({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    level: levelFilter !== "all" ? levelFilter : undefined,
  });

  // Fetch statistics
  const { data: statsData } = useTeamStatistics();

  const referrals = data?.referrals || [];
  const pagination = data?.pagination || {};
  const statistics = statsData || {};

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getLevelBadge = (level: string) => {
    const colors: any = {
      A: "green",
      B: "blue",
      C: "orange",
    };
    return (
      <Badge color={colors[level] || "gray"} size="sm">
        Level {level}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load team data. Please try again.
      </Alert>
    );
  }

  const rows = referrals.map((referral: any) => (
    <Table.Tr key={referral._id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={referral.userId?.picture} radius="xl" size="md">
            {referral.userId?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {referral.userId?.name || "N/A"}
            </Text>
            <Text size="xs" c="dimmed">
              {referral.userId?.phone || "N/A"}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={referral.referredUserId?.picture} radius="xl" size="md">
            {referral.referredUserId?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {referral.referredUserId?.name || "N/A"}
            </Text>
            <Text size="xs" c="dimmed">
              {referral.referredUserId?.phone || "N/A"}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>{getLevelBadge(referral.level)}</Table.Td>
      <Table.Td>
        <Text size="sm">{referral.referralChain?.length || 0}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {formatDate(referral.createdAt)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon variant="light" color="blue" size="sm">
              <FiEye size={14} />
            </ActionIcon>
          </Tooltip>
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
              <FiUsers size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  Total Referrals
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.totalReferrals || 0}
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
              <FiAward size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  A-Level
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.levelACount || 0}
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
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            }}
          >
            <Group>
              <FiUserCheck size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  B-Level
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.levelBCount || 0}
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
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
          >
            <Group>
              <FiTrendingUp size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>
                  C-Level
                </Text>
                <Text size="xl" fw={700} c="white">
                  {statistics.levelCCount || 0}
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
              Team Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Monitor referral network and team hierarchy
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
            placeholder="Filter by Level"
            data={[
              { value: "all", label: "All Levels" },
              { value: "A", label: "Level A" },
              { value: "B", label: "Level B" },
              { value: "C", label: "Level C" },
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

      {/* Tabs */}
      <Paper shadow="xs">
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" leftSection={<FiUsers size={14} />}>
              All Referrals
            </Tabs.Tab>
            <Tabs.Tab value="level-a" leftSection={<FiAward size={14} />}>
              Level A
            </Tabs.Tab>
            <Tabs.Tab value="level-b" leftSection={<FiUserCheck size={14} />}>
              Level B
            </Tabs.Tab>
            <Tabs.Tab value="level-c" leftSection={<FiTrendingUp size={14} />}>
              Level C
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Table.ScrollContainer minWidth={1000}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Referrer</Table.Th>
                    <Table.Th>Referred User</Table.Th>
                    <Table.Th>Level</Table.Th>
                    <Table.Th>Chain Length</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
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
                            Loading Referral...
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
                          No Referral found
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>

          <Tabs.Panel value="level-a" pt="md">
            <Table.ScrollContainer minWidth={1000}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Referrer</Table.Th>
                    <Table.Th>Referred User</Table.Th>
                    <Table.Th>Chain Length</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {referrals
                    .filter((r: any) => r.level === "A")
                    .map((referral: any) => (
                      <Table.Tr key={referral._id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.userId?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.userId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.userId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.referredUserId?.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.referredUserId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.referredUserId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {referral.referralChain?.length || 0}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDate(referral.createdAt)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>

          <Tabs.Panel value="level-b" pt="md">
            <Table.ScrollContainer minWidth={1000}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Referrer</Table.Th>
                    <Table.Th>Referred User</Table.Th>
                    <Table.Th>Chain Length</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {referrals
                    .filter((r: any) => r.level === "B")
                    .map((referral: any) => (
                      <Table.Tr key={referral._id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.userId?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.userId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.userId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.referredUserId?.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.referredUserId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.referredUserId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {referral.referralChain?.length || 0}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDate(referral.createdAt)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>

          <Tabs.Panel value="level-c" pt="md">
            <Table.ScrollContainer minWidth={1000}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Referrer</Table.Th>
                    <Table.Th>Referred User</Table.Th>
                    <Table.Th>Chain Length</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {referrals
                    .filter((r: any) => r.level === "C")
                    .map((referral: any) => (
                      <Table.Tr key={referral._id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.userId?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.userId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.userId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar radius="xl" size="md">
                              {referral.referredUserId?.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>
                                {referral.referredUserId?.name}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {referral.referredUserId?.phone}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {referral.referralChain?.length || 0}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {formatDate(referral.createdAt)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>
        </Tabs>

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
    </Flex>
  );
};

export default TeamManagement;
