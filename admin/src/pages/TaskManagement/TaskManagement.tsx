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
  Avatar,
  Pagination,
  Loader,
  Paper,
  Alert,
  Tooltip,
  NumberInput,
  FileInput,
  Switch,
  Image,
  Card,
} from "@mantine/core";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiUpload,
} from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
} from "../../hooks/query/task.query";
import classes from "./index.module.scss";

interface TaskFormData {
  videoUrl: File | null;
  thumbnail: string;
  level: string;
  levelNumber: number;
  rewardPrice: number;
  order: number;
  isActive: boolean;
}

const TaskManagement = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [sortField, setSortField] = useState("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form data
  const [formData, setFormData] = useState<TaskFormData>({
    videoUrl: null,
    thumbnail: "",
    level: "",
    levelNumber: 0,
    rewardPrice: 0,
    order: 0,
    isActive: true,
  });

  const { data, isLoading, error } = useAllTasks({
    page: activePage,
    limit: itemsPerPage,
    search: searchQuery,
    level: levelFilter !== "all" ? levelFilter : undefined,
    levelNumber: formData.levelNumber || undefined,
    isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
    sortBy: sortField,
    sortOrder,
  });

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleStatusMutation = useToggleTaskStatus();

  const tasks = data?.tasks || [];
  const pagination = data?.pagination || {};
  const statistics = data?.statistics || {};

  // Handlers
  const handleCreateTask = () => {
    setFormData({
      videoUrl: null,
      thumbnail: "",
      level: "",
      levelNumber: 1,
      rewardPrice: 0,
      order: 0,
      isActive: true,
    });
    setCreateModal(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setFormData({
      videoUrl: null,
      thumbnail: task.thumbnail || "",
      level: task.level,
      levelNumber: task.levelNumber,
      rewardPrice: task.rewardPrice,
      order: task.order,
      isActive: task.isActive,
    });
    setEditModal(true);
  };

  const handleViewTask = (task: any) => {
    setSelectedTask(task);
    setViewModal(true);
  };

  const handleDeleteTask = (task: any) => {
    setSelectedTask(task);
    setDeleteModal(true);
  };

  const confirmCreateTask = async () => {
    if (!formData.videoUrl) {
      notifications.show({
        title: "Validation Error",
        message: "Please upload a video file",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    if (!formData.level) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a level",
        color: "red",
        icon: <FiXCircle />,
      });
      return;
    }

    const form = new FormData();
    form.append("video", formData.videoUrl);
    form.append("thumbnail", formData.thumbnail);
    form.append("level", formData.level);
    form.append("levelNumber", formData.levelNumber.toString());
    form.append("rewardPrice", formData.rewardPrice.toString());
    form.append("order", formData.order.toString());

    try {
      await createTaskMutation.mutateAsync(form);

      notifications.show({
        title: "Success",
        message: "Task created successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setCreateModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to create task",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmUpdateTask = async () => {
    if (!selectedTask) return;

    const form = new FormData();
    if (formData.videoUrl) {
      form.append("video", formData.videoUrl);
    }
    form.append("thumbnail", formData.thumbnail);
    form.append("level", formData.level);
    form.append("levelNumber", formData.levelNumber.toString());
    form.append("rewardPrice", formData.rewardPrice.toString());
    form.append("order", formData.order.toString());
    form.append("isActive", formData.isActive.toString());

    try {
      await updateTaskMutation.mutateAsync({
        taskId: selectedTask._id,
        data: form,
      });

      notifications.show({
        title: "Success",
        message: "Task updated successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setEditModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to update task",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const confirmDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      await deleteTaskMutation.mutateAsync(selectedTask._id);

      notifications.show({
        title: "Success",
        message: "Task deleted successfully",
        color: "green",
        icon: <FiCheckCircle />,
      });

      setDeleteModal(false);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete task",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const handleToggleStatus = async (task: any) => {
    try {
      await toggleStatusMutation.mutateAsync(task._id);

      notifications.show({
        title: "Success",
        message: `Task ${!task.isActive ? "activated" : "deactivated"}`,
        color: "green",
        icon: <FiCheckCircle />,
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to toggle task status",
        color: "red",
        icon: <FiXCircle />,
      });
    }
  };

  const getLevelBadge = (level: string) => {
    const colors: any = {
      BASIC: "gray",
      REGULAR: "blue",
      VIP: "grape",
    };
    return (
      <Badge color={colors[level] || "gray"} size="sm">
        {level}
      </Badge>
    );
  };

  if (error) {
    return (
      <Alert icon={<FiAlertCircle />} title="Error" color="red">
        Failed to load tasks. Please try again.
      </Alert>
    );
  }

  const rows = tasks.map((task: any) => (
    <Table.Tr key={task._id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={task.thumbnail} radius="sm" size="lg">
            <FiVideo />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              Task #{task.order}
            </Text>
            <Text size="xs" c="dimmed">
              {task._id.slice(-8)}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>{getLevelBadge(task.level)}</Table.Td>
      <Table.Td>
        <Text size="sm">Level {task.levelNumber}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={600} c="blue">
          ₹{task.rewardPrice}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{task.order}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip label="Click to toggle">
          <Badge
            color={task.isActive ? "green" : "gray"}
            style={{ cursor: "pointer" }}
            onClick={() => handleToggleStatus(task)}
            size="sm"
          >
            {task.isActive ? "Active" : "Inactive"}
          </Badge>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Text size="xs" c="dimmed">
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={() => handleViewTask(task)}
            >
              <FiEye size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Edit Task">
            <ActionIcon
              variant="light"
              color="orange"
              size="sm"
              onClick={() => handleEditTask(task)}
            >
              <FiEdit size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Task">
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={() => handleDeleteTask(task)}
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
      <Group grow>
        <Paper p="md" shadow="xs" className={classes.statsCard}>
          <Group>
            <FiVideo size={32} color="white" />
            <div>
              <Text size="xs" c="white" opacity={0.9}>
                Total Tasks
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.totalTasks || 0}
              </Text>
            </div>
          </Group>
        </Paper>
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
                Active Tasks
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.activeTasks || 0}
              </Text>
            </div>
          </Group>
        </Paper>
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
                Inactive Tasks
              </Text>
              <Text size="xl" fw={700} c="white">
                {statistics.inactiveTasks || 0}
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
              Task Management
            </Text>
            <Text size="sm" c="dimmed" className={classes.subtitle}>
              Manage video tasks for all user levels
            </Text>
          </Flex>
          <Button
            leftSection={<FiPlus />}
            onClick={handleCreateTask}
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            variant="filled"
          >
            Create Task
          </Button>
        </Group>

        {/* Advanced Filters */}
          <Flex
            gap="md"
            wrap="wrap"
            align="flex-end"
            justify="space-between"
            className={classes.filters}
          >
            {/* Search */}
            <TextInput
              placeholder="Search by Task ID or Order..."
              leftSection={<FiSearch />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(1);
              }}
              style={{ flex: 1, minWidth: 220 }}
            />

            {/* Level */}
            <Select
              label="Level"
              placeholder="Select level"
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
              w={180}
            />

            {/* Level Number */}
            <NumberInput
              label="Level No."
              placeholder="e.g., 1"
              value={formData.levelNumber}
              onChange={(value) => {
                setFormData({ ...formData, levelNumber: Number(value) });
                setActivePage(1);
              }}
              min={1}
              w={120}
            />

            {/* Status */}
            <Select
              label="Status"
              placeholder="Select status"
              data={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value || "all");
                setActivePage(1);
              }}
              clearable
              w={150}
            />

            {/* Sort Options */}
            <Select
              label="Sort By"
              placeholder="Sort"
              data={[
                { value: "order", label: "Order (Ascending)" },
                { value: "-order", label: "Order (Descending)" },
                { value: "rewardPrice", label: "Reward (Low → High)" },
                { value: "-rewardPrice", label: "Reward (High → Low)" },
              ]}
              onChange={(value) => {
                if (!value) return;
                if (value.startsWith("-")) {
                  setSortField(value.slice(1));
                  setSortOrder("desc");
                } else {
                  setSortField(value);
                  setSortOrder("asc");
                }
                setActivePage(1);
              }}
              w={180}
            />

            {/* Reset Button */}
            <Button
              variant="light"
              color="gray"
              onClick={() => {
                setSearchQuery("");
                setLevelFilter("all");
                setStatusFilter("all");
                setFormData({ ...formData, levelNumber: 0 });
                setSortField("order");
                setSortOrder("asc");
                setActivePage(1);
              }}
            >
              Reset Filters
            </Button>
          </Flex>
        </Paper>

      {/* Table */}
      <Paper shadow="xs" className={classes.tableContainer}>
        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Task</Table.Th>
                <Table.Th>Level</Table.Th>
                <Table.Th>Level Number</Table.Th>
                <Table.Th>Reward</Table.Th>
                <Table.Th>Order</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Flex justify="center" align="center" py="xl">
                      <Loader size="lg" />
                      <Text c="dimmed" ml="sm">
                        Loading task...
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
                      No Task found
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

      {/* Create Task Modal */}
      <Modal
        opened={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Task"
        size="lg"
        centered
      >
        <Flex direction="column" gap="md">
          <FileInput
            label="Video File"
            placeholder="Upload video"
            accept="video/*"
            leftSection={<FiUpload />}
            onChange={(file) => setFormData({ ...formData, videoUrl: file })}
            required
            description="Max size: 100MB. Supported: MP4, AVI, MOV, WebM"
          />

          <TextInput
            label="Thumbnail URL"
            placeholder="Enter thumbnail URL"
            value={formData.thumbnail}
            onChange={(e) =>
              setFormData({ ...formData, thumbnail: e.target.value })
            }
          />

          <Select
            label="Level"
            placeholder="Select level"
            data={[
              { value: "BASIC", label: "Basic" },
              { value: "REGULAR", label: "Regular" },
              { value: "VIP", label: "VIP" },
            ]}
            value={formData.level}
            onChange={(value) =>
              setFormData({ ...formData, level: value || "" })
            }
            required
          />

          <NumberInput
            label="Level Number"
            placeholder="Enter level number"
            value={formData.levelNumber}
            onChange={(value) =>
              setFormData({ ...formData, levelNumber: Number(value) })
            }
            min={1}
            required
          />

          <NumberInput
            label="Reward Price (₹)"
            placeholder="Enter reward amount"
            value={formData.rewardPrice}
            onChange={(value) =>
              setFormData({ ...formData, rewardPrice: Number(value) })
            }
            min={0}
            prefix="₹"
            required
          />

          <NumberInput
            label="Order"
            placeholder="Enter task order"
            value={formData.order}
            onChange={(value) =>
              setFormData({ ...formData, order: Number(value) })
            }
            min={0}
            description="Lower numbers appear first"
          />

          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="subtle"
              onClick={() => setCreateModal(false)}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreateTask}
              loading={createTaskMutation.isPending}
              leftSection={<FiPlus />}
            >
              Create Task
            </Button>
          </Group>
        </Flex>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        opened={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Task"
        size="lg"
        centered
      >
        {selectedTask && (
          <Flex direction="column" gap="md">
            <FileInput
              label="Video File (Optional)"
              placeholder="Upload new video"
              accept="video/*"
              leftSection={<FiUpload />}
              onChange={(file) => setFormData({ ...formData, videoUrl: file })}
              description="Leave empty to keep current video"
            />

            <TextInput
              label="Thumbnail URL"
              placeholder="Enter thumbnail URL"
              value={formData.thumbnail}
              onChange={(e) =>
                setFormData({ ...formData, thumbnail: e.target.value })
              }
            />

            <Select
              label="Level"
              placeholder="Select level"
              data={[
                { value: "BASIC", label: "Basic" },
                { value: "REGULAR", label: "Regular" },
                { value: "VIP", label: "VIP" },
              ]}
              value={formData.level}
              onChange={(value) =>
                setFormData({ ...formData, level: value || "" })
              }
              required
            />

            <NumberInput
              label="Level Number"
              placeholder="Enter level number"
              value={formData.levelNumber}
              onChange={(value) =>
                setFormData({ ...formData, levelNumber: Number(value) })
              }
              min={1}
              required
            />

            <NumberInput
              label="Reward Price (₹)"
              placeholder="Enter reward amount"
              value={formData.rewardPrice}
              onChange={(value) =>
                setFormData({ ...formData, rewardPrice: Number(value) })
              }
              min={0}
              prefix="₹"
              required
            />

            <NumberInput
              label="Order"
              placeholder="Enter task order"
              value={formData.order}
              onChange={(value) =>
                setFormData({ ...formData, order: Number(value) })
              }
              min={0}
            />

            <Switch
              label="Active Status"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.currentTarget.checked })
              }
            />

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setEditModal(false)}
                disabled={updateTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="orange"
                onClick={confirmUpdateTask}
                loading={updateTaskMutation.isPending}
                leftSection={<FiEdit />}
              >
                Update Task
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>

      {/* View Task Modal */}
      <Modal
        opened={viewModal}
        onClose={() => setViewModal(false)}
        title="Task Details"
        size="lg"
        centered
      >
        {selectedTask && (
          <Flex direction="column" gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              {selectedTask.thumbnail && (
                <Card.Section>
                  <Image
                    src={selectedTask.thumbnail}
                    height={200}
                    alt="Task thumbnail"
                  />
                </Card.Section>
              )}

              <Group justify="space-between" mt="md">
                <Text fw={500}>Level</Text>
                {getLevelBadge(selectedTask.level)}
              </Group>

              <Group justify="space-between" mt="sm">
                <Text fw={500}>Level Number</Text>
                <Text>Level {selectedTask.levelNumber}</Text>
              </Group>

              <Group justify="space-between" mt="sm">
                <Text fw={500}>Reward</Text>
                <Text fw={600} c="blue">
                  ₹{selectedTask.rewardPrice}
                </Text>
              </Group>

              <Group justify="space-between" mt="sm">
                <Text fw={500}>Order</Text>
                <Text>{selectedTask.order}</Text>
              </Group>

              <Group justify="space-between" mt="sm">
                <Text fw={500}>Status</Text>
                <Badge color={selectedTask.isActive ? "green" : "gray"}>
                  {selectedTask.isActive ? "Active" : "Inactive"}
                </Badge>
              </Group>

              <Group justify="space-between" mt="sm">
                <Text fw={500}>Created</Text>
                <Text size="sm">
                  {new Date(selectedTask.createdAt).toLocaleString()}
                </Text>
              </Group>

              {selectedTask.videoUrl && (
                <Group justify="space-between" mt="sm">
                  <Text fw={500}>Video</Text>
                  <Button
                    size="xs"
                    variant="light"
                    component="a"
                    href={selectedTask.videoUrl}
                    target="_blank"
                  >
                    View Video
                  </Button>
                </Group>
              )}
            </Card>
          </Flex>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Task"
        centered
      >
        {selectedTask && (
          <Flex direction="column" gap="md">
            <Alert icon={<FiAlertCircle />} title="Warning" color="red">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </Alert>

            <Text size="sm" c="dimmed">
              Task: <strong>Task #{selectedTask.order}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Level: <strong>{selectedTask.level}</strong>
            </Text>

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="subtle"
                onClick={() => setDeleteModal(false)}
                disabled={deleteTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={confirmDeleteTask}
                loading={deleteTaskMutation.isPending}
                leftSection={<FiTrash2 />}
              >
                Delete Task
              </Button>
            </Group>
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default TaskManagement;
