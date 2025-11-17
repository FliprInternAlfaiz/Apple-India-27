import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Button,
  Table,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Group,
  Paper,
  Image,
  Text,
  Loader,
  Switch,
  Pagination,
  FileInput,
  Flex,
  Card,
  Grid,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IoAdd,
  IoTrash,
  IoEye,
  IoPower,
  IoImage,
  IoClose,
  IoCheckmark,
  IoAlertCircle,
} from "react-icons/io5";
import { FiActivity, FiEye, FiXCircle } from "react-icons/fi";
import { notifications } from "@mantine/notifications";
import {
  useAllConferenceNews,
  useCreateConferenceNews,
  useDeleteConferenceNews,
  useToggleConferenceNewsStatus,
  useUploadConferenceImage,
} from "../../hooks/query/conferenceNews.query";

const ConferenceNewsManagement = () => {
  const [activePage, setActivePage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    undefined
  );
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [priority, setPriority] = useState(0);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [clickUrl, setClickUrl] = useState("");

  // Queries and Mutations
  const { data, isLoading, refetch } = useAllConferenceNews(
    activePage,
    10,
    isActiveFilter
  );
  const uploadImageMutation = useUploadConferenceImage();
  const createNewsMutation = useCreateConferenceNews();
  const deleteNewsMutation = useDeleteConferenceNews();
  const toggleStatusMutation = useToggleConferenceNewsStatus();

  const newsList = data?.data?.conferenceNews || [];
  const pagination = data?.data?.pagination;

  // Statistics
  const stats = {
    total: newsList.length,
    active: newsList.filter((n: any) => n.isActive).length,
    totalViews: newsList.reduce((sum: number, n: any) => sum + n.viewCount, 0),
    totalCloses: newsList.reduce(
      (sum: number, n: any) => sum + n.closeCount,
      0
    ),
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageUrl("");
    setPriority(0);
    setExpiryDate(null);
    setClickUrl("");
  };

  // Handle Image Preview
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

 const handleImageUpload = async (): Promise<string> => {
  if (!imageFile) return "";

  try {
    const result = await uploadImageMutation.mutateAsync(imageFile); // Pass File, NOT FormData
    const uploadedUrl = result.data.imageUrl; // or result.data.url depending on API
    setImageUrl(uploadedUrl);
    return uploadedUrl;
  } catch (error) {
    notifications.show({
      title: "Upload Failed",
      message: "Failed to upload image",
      color: "red",
      icon: <IoClose />,
    });
    throw error;
  }
};

  const handleCreate = async () => {
    if (!title || !description) {
      notifications.show({
        title: "Validation Error",
        message: "Title and description are required",
        color: "red",
        icon: <IoAlertCircle />,
      });
      return;
    }

    try {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        finalImageUrl = await handleImageUpload();
      }

      if (!finalImageUrl) {
        notifications.show({
          title: "Validation Error",
          message: "Image is required",
          color: "red",
          icon: <IoAlertCircle />,
        });
        return;
      }

      await createNewsMutation.mutateAsync({
        title,
        description,
        imageUrl: finalImageUrl,
        priority,
       expiryDate : expiryDate || undefined,
        clickUrl,
      });

      notifications.show({
        title: "Success",
        message: "Conference news created successfully",
        color: "green",
        icon: <IoCheckmark />,
      });

      setCreateModalOpened(false);
      resetForm();
      refetch();
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to create news",
        color: "red",
        icon: <IoClose />,
      });
    }
  };

  const handleDelete = async (newsId: string) => {
    if (!window.confirm("Are you sure you want to delete this news?")) return;

    try {
      await deleteNewsMutation.mutateAsync(newsId);
      notifications.show({
        title: "Success",
        message: "Conference news deleted successfully",
        color: "green",
        icon: <IoCheckmark />,
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete news",
        color: "red",
        icon: <IoClose />,
      });
    }
  };

  const handleToggleStatus = async (newsId: string) => {
    try {
      await toggleStatusMutation.mutateAsync(newsId);
      notifications.show({
        title: "Success",
        message: "Status updated successfully",
        color: "green",
        icon: <IoCheckmark />,
      });
      refetch();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update status",
        color: "red",
        icon: <IoClose />,
      });
    }
  };

  const handleView = (news: any) => {
    setSelectedNews(news);
    setViewModalOpened(true);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: "400px" }}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <FiActivity size={32} color="#667eea" />
              <div>
                <Text size="xs" c="dimmed">
                  Total News
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <IoPower size={32} color="#38ef7d" />
              <div>
                <Text size="xs" c="dimmed">
                  Active
                </Text>
                <Text size="xl" fw={700} c="green">
                  {stats.active}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <FiEye size={32} color="#4facfe" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Views
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalViews}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <FiXCircle size={32} color="#f093fb" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Closes
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalCloses}
                </Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Header */}
      <Paper p="md" shadow="sm" mb="lg">
        <Group justify="space-between">
          <Flex gap={10} direction="column" justify="flex-start">
            <Title order={4}>Conference News Management</Title>
            <Text size="sm" c="dimmed">
              Manage announcement popups
            </Text>
          </Flex>
          <Group>
            <Switch
              label="Show Active Only"
              checked={isActiveFilter === true}
              onChange={(e) =>
                setIsActiveFilter(e.currentTarget.checked ? true : undefined)
              }
            />
            <Button
              leftSection={<IoAdd />}
              onClick={() => setCreateModalOpened(true)}
              gradient={{ from: "blue", to: "cyan" }}
              variant="gradient"
            >
              Create News
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Table */}
      <Paper shadow="sm">
        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Image</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Views</Table.Th>
                <Table.Th>Closes</Table.Th>
                <Table.Th>Expiry</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {newsList.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text ta="center" py="xl" c="dimmed">
                      No conference news found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                newsList.map((news: any) => (
                  <Table.Tr key={news._id}>
                    <Table.Td>
                      <Image
                        src={news.imageUrl}
                        alt={news.title}
                        width={80}
                        height={60}
                        radius="sm"
                        fit="cover"
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500} lineClamp={2}>
                        {news.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color="blue">{news.priority}</Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={news.isActive ? "green" : "gray"}>
                        {news.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{news.viewCount}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{news.closeCount}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {news.expiryDate
                          ? new Date(news.expiryDate).toLocaleDateString()
                          : "No Expiry"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleView(news)}
                        >
                          <IoEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color={news.isActive ? "orange" : "green"}
                          onClick={() => handleToggleStatus(news._id)}
                        >
                          <IoPower size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(news._id)}
                        >
                          <IoTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {pagination && pagination.totalPages > 1 && (
          <Group justify="center" p="md">
            <Pagination
              value={activePage}
              onChange={setActivePage}
              total={pagination.totalPages}
            />
          </Group>
        )}
      </Paper>

      {/* Create Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => {
          setCreateModalOpened(false);
          resetForm();
        }}
        title="Create Conference News"
        size="lg"
        centered
      >
        <Flex direction="column" gap="md">
          <TextInput
            label="Title"
            placeholder="Enter announcement title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Description"
            placeholder="Enter announcement description"
            required
            minRows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <FileInput
            label="Upload Image"
            placeholder="Choose image file"
            accept="image/*"
            leftSection={<IoImage />}
            value={imageFile}
            onChange={setImageFile}
          />

          {imagePreviewUrl && (
            <Image
              src={imagePreviewUrl}
              alt="Preview"
              height={200}
              radius="md"
            />
          )}

          <NumberInput
            label="Priority"
            description="Higher priority news will be shown first"
            value={priority}
            onChange={(val) => setPriority(Number(val))}
            min={0}
          />

          <DateTimePicker
            label="Expiry Date (Optional)"
            placeholder="Select expiry date"
            value={expiryDate}
            onChange={(val) => setExpiryDate(val)}
            clearable
          />

          <TextInput
            label="Click URL (Optional)"
            placeholder="https://example.com"
            value={clickUrl}
            onChange={(e) => setClickUrl(e.target.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setCreateModalOpened(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              leftSection={<IoCheckmark />}
            >
              Create
            </Button>
          </Group>
        </Flex>
      </Modal>

      {/* View Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="News Details"
        size="lg"
        centered
      >
        {selectedNews && (
          <Flex direction="column" gap="md">
            <Image
              src={selectedNews.imageUrl}
              alt={selectedNews.title}
              radius="md"
            />

            <Title order={3}>{selectedNews.title}</Title>
            <Text>{selectedNews.description}</Text>

            <Group>
              <Badge color={selectedNews.isActive ? "green" : "gray"}>
                {selectedNews.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge color="blue">Priority: {selectedNews.priority}</Badge>
            </Group>

            <Group>
              <Text size="sm">👁️ {selectedNews.viewCount} views</Text>
              <Text size="sm">❌ {selectedNews.closeCount} closes</Text>
            </Group>

            {selectedNews.clickUrl && (
              <Button
                component="a"
                href={selectedNews.clickUrl}
                target="_blank"
                variant="light"
              >
                Visit URL
              </Button>
            )}
          </Flex>
        )}
      </Modal>
    </Container>
  );
};

export default ConferenceNewsManagement;
