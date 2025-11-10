// pages/admin/LevelManagement.tsx
import React, { useState } from 'react';
import { 
  Text, 
  Group, 
  Flex, 
  Table, 
  Badge, 
  ActionIcon, 
  TextInput, 
  Button, 
  Modal, 
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  NumberInput,
  Switch,
  Card,
  Grid
} from '@mantine/core';
import { 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiPlus,
  FiAlertCircle,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiDollarSign
} from 'react-icons/fi';
import { notifications } from '@mantine/notifications';
import {
  useAllLevels,
  useCreateLevel,
  useUpdateLevel,
  useDeleteLevel
} from '../../hooks/query/level.query';
import classes from './index.module.scss';

interface LevelFormData {
  levelNumber: number;
  levelName: string;
  investmentAmount: number;
  rewardPerTask: number;
  dailyTaskLimit: number;
  aLevelCommissionRate: number;
  bLevelCommissionRate: number;
  cLevelCommissionRate: number;
  icon: string;
  description: string;
  order: number;
  isActive: boolean;
}

const LevelManagement = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);

  // Form data
  const [formData, setFormData] = useState<LevelFormData>({
    levelNumber: 0,
    levelName: '',
    investmentAmount: 0,
    rewardPerTask: 0,
    dailyTaskLimit: 0,
    aLevelCommissionRate: 0,
    bLevelCommissionRate: 0,
    cLevelCommissionRate: 0,
    icon: '🍎',
    description: '',
    order: 0,
    isActive: true
  });

  // Fetch levels
  const { data, isLoading, error } = useAllLevels({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined
  });

  // Mutations
  const createLevelMutation = useCreateLevel();
  const updateLevelMutation = useUpdateLevel();
  const deleteLevelMutation = useDeleteLevel();

  const levels = data?.levels || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  // Handlers
  const handleCreateLevel = () => {
    setFormData({
      levelNumber: 0,
      levelName: '',
      investmentAmount: 0,
      rewardPerTask: 0,
      dailyTaskLimit: 0,
      aLevelCommissionRate: 0,
      bLevelCommissionRate: 0,
      cLevelCommissionRate: 0,
      icon: '🍎',
      description: '',
      order: 0,
      isActive: true
    });
    setCreateModal(true);
  };

  const handleEditLevel = (level: any) => {
    setSelectedLevel(level);
    setFormData({
      levelNumber: level.levelNumber,
      levelName: level.levelName,
      investmentAmount: level.investmentAmount,
      rewardPerTask: level.rewardPerTask,
      dailyTaskLimit: level.dailyTaskLimit,
      aLevelCommissionRate: level.aLevelCommissionRate,
      bLevelCommissionRate: level.bLevelCommissionRate,
      cLevelCommissionRate: level.cLevelCommissionRate,
      icon: level.icon || '🍎',
      description: level.description || '',
      order: level.order,
      isActive: level.isActive
    });
    setEditModal(true);
  };

  const handleDeleteLevel = (level: any) => {
    setSelectedLevel(level);
    setDeleteModal(true);
  };

  const confirmCreateLevel = async () => {
    if (!formData.levelName || formData.rewardPerTask <= 0 || formData.dailyTaskLimit <= 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fill all required fields',
        color: 'red',
        icon: <FiXCircle />
      });
      return;
    }

    try {
      await createLevelMutation.mutateAsync(formData);

      notifications.show({
        title: 'Success',
        message: 'Level created successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setCreateModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  const confirmUpdateLevel = async () => {
    if (!selectedLevel) return;

    try {
      await updateLevelMutation.mutateAsync({
        levelId: selectedLevel._id,
        data: formData
      });

      notifications.show({
        title: 'Success',
        message: 'Level updated successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setEditModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  const confirmDeleteLevel = async () => {
    if (!selectedLevel) return;

    try {
      await deleteLevelMutation.mutateAsync(selectedLevel._id);

      notifications.show({
        title: 'Success',
        message: 'Level deleted successfully',
        color: 'green',
        icon: <FiCheckCircle />
      });

      setDeleteModal(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete level',
        color: 'red',
        icon: <FiXCircle />
      });
    }
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load levels. Please try again.
      </Alert>
    );
  }

  const rows = levels.map((level: any) => (
    <Table.Tr key={level._id}>
      <Table.Td>
        <Group gap="sm">
          <Text size="2xl">{level.icon}</Text>
          <div>
            <Text size="sm" fw={500}>{level.levelName}</Text>
            <Text size="xs" c="dimmed">Level {level.levelNumber}</Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="blue">₹{level.investmentAmount}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="green">₹{level.rewardPerTask}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{level.dailyTaskLimit}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          A: {level.aLevelCommissionRate}% | B: {level.bLevelCommissionRate}% | C: {level.cLevelCommissionRate}%
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={level.isActive ? 'green' : 'gray'} size="sm">
          {level.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit Level">
            <ActionIcon 
              variant="light" 
              color="orange"
              size="sm"
              onClick={() => handleEditLevel(level)}
            >
              <FiEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Level">
            <ActionIcon 
              variant="light" 
              color="red"
              size="sm"
              onClick={() => handleDeleteLevel(level)}
            >
              <FiTrash2 size={14} />
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
              <FiAward size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Total Levels</Text>
                <Text size="xl" fw={700} c="white">{statistics.totalLevels || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" shadow="xs" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <Group>
              <FiCheckCircle size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Active Levels</Text>
                <Text size="xl" fw={700} c="white">{statistics.activeLevels || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" shadow="xs" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Group>
              <FiDollarSign size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Total Investment</Text>
                <Text size="xl" fw={700} c="white">₹{statistics.totalInvestment || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" shadow="xs" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Group>
              <FiTrendingUp size={32} color="white" />
              <div>
                <Text size="xs" c="white" opacity={0.9}>Total Users</Text>
                <Text size="xl" fw={700} c="white">{statistics.totalUsers || 0}</Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Header */}
      <Paper p="md" shadow="xs" className={classes.header}>
        <Group justify="space-between" mb="md">
          <Flex gap="xs" direction="column" align="flex-start">
            <Text size="xl" fw={700} className={classes.title}>Level Management</Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage investment levels and rewards
            </Text>
          </Flex>
          <Button 
            leftSection={<FiPlus />} 
            onClick={handleCreateLevel}
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            variant="gradient"
          >
            Create Level
          </Button>
        </Group>

        {/* Filters */}
        <Group gap="md" className={classes.filters}>
          <TextInput
            placeholder="Search levels..."
            leftSection={<FiSearch />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActivePage(1);
            }}
            style={{ flex: 1 }}
            className={classes.searchInput}
          />
        </Group>
      </Paper>

      {/* Table */}
      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta="center">Level</Table.Th>
                <Table.Th ta="center">Investment</Table.Th>
                <Table.Th ta="center">Reward/Task</Table.Th>
                <Table.Th ta="center">Daily Tasks</Table.Th>
                <Table.Th ta="center">Commission Rates</Table.Th>
                <Table.Th ta="center">Status</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
              <Table.Tbody>
                          {isLoading ? (
                            <Table.Tr>
                              <Table.Td colSpan={9}>
                                <Flex justify="center"  direction="column" align="center" py="xl">
                                  <Loader size="lg" />
                                  <Text c="dimmed" ml="sm">
                                    Loading Level...
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
                                  No Level found
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

      {/* Create Level Modal */}
      <Modal
        opened={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Level"
        size="lg"
        centered
      >
        <Flex direction="column" gap="md">
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Level Number"
                placeholder="Enter level number"
                value={formData.levelNumber}
                onChange={(value) => setFormData({ ...formData, levelNumber: Number(value) })}
                min={0}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Level Name"
                placeholder="e.g., AppleMini, AppleMax"
                value={formData.levelName}
                onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                required
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Investment Amount (₹)"
                placeholder="Enter investment"
                value={formData.investmentAmount}
                onChange={(value) => setFormData({ ...formData, investmentAmount: Number(value) })}
                min={0}
                prefix="₹"
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput
                label="Reward Per Task (₹)"
                placeholder="Enter reward"
                value={formData.rewardPerTask}
                onChange={(value) => setFormData({ ...formData, rewardPerTask: Number(value) })}
                min={0}
                prefix="₹"
                required
              />
            </Grid.Col>
          </Grid>

          <NumberInput
            label="Daily Task Limit"
            placeholder="Enter daily task limit"
            value={formData.dailyTaskLimit}
            onChange={(value) => setFormData({ ...formData, dailyTaskLimit: Number(value) })}
            min={1}
            required
          />

          <Text size="sm" fw={500}>Commission Rates (%)</Text>
          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="A-Level"
                value={formData.aLevelCommissionRate}
                onChange={(value) => setFormData({ ...formData, aLevelCommissionRate: Number(value) })}
                min={0}
                max={100}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="B-Level"
                value={formData.bLevelCommissionRate}
                onChange={(value) => setFormData({ ...formData, bLevelCommissionRate: Number(value) })}
                min={0}
                max={100}
                suffix="%"
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="C-Level"
                value={formData.cLevelCommissionRate}
                onChange={(value) => setFormData({ ...formData, cLevelCommissionRate: Number(value) })}
                min={0}
                max={100}
                suffix="%"
              />
            </Grid.Col>
          </Grid>

          <TextInput
            label="Icon"
            placeholder="Enter emoji icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />

          <TextInput
            label="Description"
            placeholder="Enter level description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <NumberInput
            label="Order"
            placeholder="Display order"
            value={formData.order}
            onChange={(value) => setFormData({ ...formData, order: Number(value) })}
            min={0}
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button 
              variant="subtle" 
              onClick={() => setCreateModal(false)}
              disabled={createLevelMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmCreateLevel}
              loading={createLevelMutation.isPending}
              leftSection={<FiPlus />}
            >
              Create Level
            </Button>
          </Group>
        </Flex>
      </Modal>

      {/* Edit Level Modal */}
      <Modal
        opened={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Level"
        size="lg"
        centered
      >
        {selectedLevel && (
          <Flex direction="column" gap="md">
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Level Number"
                  value={formData.levelNumber}
                  onChange={(value) => setFormData({ ...formData, levelNumber: Number(value) })}
                  min={0}
                  disabled
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Level Name"
                  value={formData.levelName}
                  onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
                  disabled
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Investment Amount (₹)"
                  value={formData.investmentAmount}
                  onChange={(value) => setFormData({ ...formData, investmentAmount: Number(value) })}
                  min={0}
                  prefix="₹"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Reward Per Task (₹)"
                  value={formData.rewardPerTask}
                  onChange={(value) => setFormData({ ...formData, rewardPerTask: Number(value) })}
                  min={0}
                  prefix="₹"
                />
              </Grid.Col>
            </Grid>

            <NumberInput
              label="Daily Task Limit"
              value={formData.dailyTaskLimit}
              onChange={(value) => setFormData({ ...formData, dailyTaskLimit: Number(value) })}
              min={1}
            />

            <Text size="sm" fw={500}>Commission Rates (%)</Text>
            <Grid>
              <Grid.Col span={4}>
                <NumberInput
                  label="A-Level"
                  value={formData.aLevelCommissionRate}
                  onChange={(value) => setFormData({ ...formData, aLevelCommissionRate: Number(value) })}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="B-Level"
                  value={formData.bLevelCommissionRate}
                  onChange={(value) => setFormData({ ...formData, bLevelCommissionRate: Number(value) })}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="C-Level"
                  value={formData.cLevelCommissionRate}
                  onChange={(value) => setFormData({ ...formData, cLevelCommissionRate: Number(value) })}
                  min={0}
                  max={100}
                  suffix="%"
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <NumberInput
              label="Order"
              value={formData.order}
              onChange={(value) => setFormData({ ...formData, order: Number(value) })}
              min={0}
            />

            <Switch
              label="Active Status"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button 
                variant="subtle" 
                onClick={() => setEditModal(false)}
                disabled={updateLevelMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                color="orange"
                onClick={confirmUpdateLevel}
                loading={updateLevelMutation.isPending}
                leftSection={<FiEdit />}
              >
                Update Level
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Level"
        centered
      >
        {selectedLevel && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiAlertCircle />} title="Warning" color="red">
              Are you sure you want to delete this level? This action cannot be undone and may affect users.
            </Alert>

            <Text size="sm" c="dimmed">
              Level: <strong>{selectedLevel.levelName}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Level Number: <strong>{selectedLevel.levelNumber}</strong>
            </Text>

            <Group justify="flex-end" gap="sm" mt="md">
              <Button 
                variant="subtle" 
                onClick={() => setDeleteModal(false)}
                disabled={deleteLevelMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                color="red"
                onClick={confirmDeleteLevel}
                loading={deleteLevelMutation.isPending}
                leftSection={<FiTrash2 />}
              >
                Delete Level
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default LevelManagement;