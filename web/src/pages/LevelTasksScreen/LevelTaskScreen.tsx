import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Loader,
  Alert,
  Button,
  Text,
  Badge,
  Progress,
  Grid,
  Card,
  Title,
  Stack,
  Divider,
  Table,
  Group,
  Container,
  ScrollArea,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Star, Trophy, Lock, CheckCircle } from "lucide-react";
import {
  useGetAllLevelsQuery,
  useUpgradeUserLevelMutation,
} from "../../hooks/query/useLevel.query";

interface Invitation {
  method: string;
  rate: string;
  amount: number;
}

interface Level {
  _id: string;
  level: string;
  levelNumber: number;
  target: number;
  rewardPerTask: number;
  commission: number;
  dailyTaskLimit: number;
  completed: number;
  remaining: number;
  isUnlocked: boolean;
  isCurrent: boolean;
  icon: string;
  description: string;
  invitations: Invitation[];
}

interface UserLevel {
  currentLevel: string;
  currentLevelNumber: number;
  todayTasksCompleted: number;
}

const LevelTasksScreen: React.FC = () => {
  const { data, isLoading, isError } = useGetAllLevelsQuery();
  const levels: Level[] = data?.levels ?? [];
  const fetchedUserLevel: UserLevel | null = data?.userLevel ?? null;
  const upgradeMutation = useUpgradeUserLevelMutation();

  const [activeLevelIndex, setActiveLevelIndex] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);

  useEffect(() => {
    if (fetchedUserLevel) {
      setUserLevel(fetchedUserLevel);
      localStorage.setItem("userLevel", JSON.stringify(fetchedUserLevel));
    }
  }, [fetchedUserLevel]);

  useEffect(() => {
    if (userLevel && levels.length > 0) {
      const currentIndex = levels.findIndex(
        (l: Level) => l.levelNumber === userLevel.currentLevelNumber
      );
      if (currentIndex !== -1) {
        setActiveLevelIndex(currentIndex);
      }
    }
  }, [levels, userLevel]);

  const currentLevel = useMemo(
    () => levels[activeLevelIndex],
    [levels, activeLevelIndex]
  );

  const handleUpgrade = async (levelNumber: number) => {
    try {
      await upgradeMutation.mutateAsync({ newLevelNumber: levelNumber });
      notifications.show({
        title: "Success",
        message: "Your level has been upgraded!",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Upgrade Failed",
        message:
          error?.response?.data?.message ||
          "Unable to upgrade level right now.",
        color: "red",
      });
    }
  };

  if (isLoading) {
    return (
      <Box ta="center" mih="400px" mt="xl">
        <Loader color="blue" size="lg" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert color="red" title="Error">
        Failed to load levels. Please try again later.
      </Alert>
    );
  }

  if (!currentLevel) {
    return (
      <Alert color="blue" title="Info">
        No levels available.
      </Alert>
    );
  }

  const progressPercentage =
    currentLevel.dailyTaskLimit > 0
      ? (currentLevel.completed / currentLevel.dailyTaskLimit) * 100
      : 0;

  return (
    <Container size="lg" py="md">
      {/* ✅ Current Level Info */}
      {userLevel && (
        <Card shadow="sm" radius="md" mb="md" withBorder>
          <Stack gap={4}>
            <Text fw={600} c="blue">
              Your Current Level: {currentLevel.icon} {userLevel.currentLevel}
            </Text>
            <Text size="sm" c="dimmed">
              Tasks Completed Today: {userLevel.todayTasksCompleted} /{" "}
              {currentLevel.dailyTaskLimit}
            </Text>
          </Stack>
        </Card>
      )}

      {/* ✅ Level Selector */}
      <ScrollArea mb="md" scrollbarSize={6}>
        <Group justify="flex-start" gap="sm" wrap="nowrap">
          {levels.map((level: Level, index: number) => (
            <Button
              key={level.levelNumber}
              variant={activeLevelIndex === index ? "filled" : "outline"}
              color={activeLevelIndex === index ? "blue" : "gray"}
              size="sm"
              onClick={() => setActiveLevelIndex(index)}
              leftSection={
                level.isUnlocked ? (
                  level.isCurrent ? (
                    <Star size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )
                ) : (
                  <Lock size={16} />
                )
              }
              opacity={level.isUnlocked ? 1 : 0.6}
            >
              {level.icon} {level.level}
            </Button>
          ))}
        </Group>
      </ScrollArea>

      {/* ✅ Current Level Card */}
      <Card shadow="md" mb="lg" radius="md" withBorder>
        <Stack>
          <Box bg="blue.6" p="md" style={{ borderRadius: rem(6) }}>
            <Title order={4} c="white">
              {currentLevel.icon} {currentLevel.level}
            </Title>
            <Group mt="xs">
              {currentLevel.isCurrent && <Badge color="green">Current</Badge>}
              {!currentLevel.isUnlocked && <Badge color="red">Locked</Badge>}
            </Group>
            <Text size="sm" mt="xs" c="white">
              {currentLevel.description}
            </Text>
          </Box>

          <Stack gap="sm" p="sm">
            {/* Investment */}
            <Box>
              <Text fw={500} c="blue.7">
                Investment Required: ₹{currentLevel.target.toLocaleString()}
              </Text>
              {!currentLevel.isUnlocked && (
                <Button
                  mt="sm"
                  color="blue"
                  loading={upgradeMutation.isPending}
                  onClick={() => handleUpgrade(currentLevel.levelNumber)}
                >
                  Upgrade to {currentLevel.level}
                </Button>
              )}
            </Box>

            {/* Daily Progress */}
            {currentLevel.isCurrent && (
              <Box>
                <Text size="sm" fw={500}>
                  Daily Progress: {currentLevel.completed} /{" "}
                  {currentLevel.dailyTaskLimit} tasks
                </Text>
                <Progress
                  value={progressPercentage}
                  color={progressPercentage >= 100 ? "green" : "blue"}
                  size="lg"
                  radius="xl"
                  mt={6}
                />
                <Text size="xs" c="dimmed" mt={4}>
                  {currentLevel.remaining} tasks remaining today
                </Text>
              </Box>
            )}

            <Divider />

            {/* Daily Earnings */}
            <Box bg="green.0" p="md">
              <Group>
                <Trophy size={18} color="green" />
                <Title order={5} c="green.7">
                  Daily Earnings
                </Title>
              </Group>
              <Grid mt="sm">
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Per Task
                  </Text>
                  <Text size="xl" fw={700} c="green.7">
                    ₹{currentLevel.rewardPerTask}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Daily Income
                  </Text>
                  <Text size="xl" fw={700} c="green.7">
                    ₹{currentLevel.commission}
                  </Text>
                </Grid.Col>
              </Grid>
              <Text size="sm" c="dimmed" mt="xs">
                💸 Earnings added to Commission Wallet
              </Text>
            </Box>

            <Divider />

            {/* Referral Table */}
            <Box>
              <Title order={5} mb="xs">
                Referral Commission Rates
              </Title>
              <Table striped highlightOnHover withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Level</Table.Th>
                    <Table.Th ta="right">Rate</Table.Th>
                    <Table.Th ta="right">Amount</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {currentLevel.invitations.map(
                    (inv: Invitation, idx: number) => (
                      <Table.Tr key={idx}>
                        <Table.Td>{inv.method}</Table.Td>
                        <Table.Td ta="right" fw={500} c="blue.7">
                          {inv.rate}
                        </Table.Td>
                        <Table.Td ta="right" fw={500} c="green.7">
                          ₹{inv.amount}
                        </Table.Td>
                      </Table.Tr>
                    )
                  )}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        </Stack>
      </Card>

      {/* ✅ All Levels Overview */}
      <Card withBorder>
        <Title order={4} mb="md">
          All Apple Levels
        </Title>
        <Grid>
          {levels.map((level: Level) => (
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={level._id}>
              <Card
                shadow="xs"
                radius="md"
                withBorder
                style={{
                  cursor: "pointer",
                  opacity: level.isUnlocked ? 1 : 0.7,
                  transition: "0.2s",
                }}
                onClick={() => setActiveLevelIndex(levels.indexOf(level))}
              >
                <Stack gap="xs">
                  <Text fz="xl">{level.icon}</Text>
                  <Text fw={600}>{level.level}</Text>
                  <Text size="sm" c="dimmed">
                    ₹{level.target.toLocaleString()}
                  </Text>
                  <Group gap="xs">
                    <Badge color={level.isUnlocked ? "green" : "red"}>
                      {level.isUnlocked ? "Unlocked" : "Locked"}
                    </Badge>
                    {level.isCurrent && <Badge color="blue">Active</Badge>}
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    </Container>
  );
};

export default LevelTasksScreen;
