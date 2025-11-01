import React, { useRef, useCallback, useEffect, useState } from "react"; 
import { Flex, Text, Loader, Alert, Badge, Box, Progress, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, CheckCircle, ShoppingCart } from "lucide-react";
import classes from "./Task.module.scss";
import TaskItem from "../../components/TaskItem/TaskItem";
import { useInfiniteTasksQuery } from "../../hooks/query/useGetTask.query";

const Task: React.FC = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState<any>(null);

  // Get user level from localStorage or API
  useEffect(() => {
    const storedLevel = localStorage.getItem("userLevel");
    if (storedLevel) {
      try {
        setUserLevel(JSON.parse(storedLevel));
      } catch (error) {
        console.error("Failed to parse user level:", error);
        setUserLevel(null);
      }
    }
  }, []);

  // Safely get current level name, handle null/undefined cases
  const currentLevelName = userLevel?.currentLevel && userLevel.currentLevel !== "null" 
    ? userLevel.currentLevel 
    : undefined;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteTasksQuery({ 
    level: currentLevelName, 
    limit: 10 
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastTaskRef = useCallback(
    (node: HTMLDivElement) => {
      if (isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const handleTaskClick = (taskId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      navigate(`/task/${taskId}`);
    }
  };

  const handlePurchaseLevel = () => {
    // Navigate to level purchase page
    navigate("/levels");
  };

  // Loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  // Safely extract data with fallbacks
  const allTasks = data?.pages?.flatMap((page) => page?.tasks || [])?.filter(Boolean) || [];
  const stats = data?.pages?.[0]?.stats;
  const totalTasks = data?.pages?.[0]?.pagination?.totalTasks || 0;
  const requiresLevelPurchase = data?.pages?.[0]?.requiresLevelPurchase || false;

  const dailyLimit = stats?.dailyLimit || 0;
  const todayCompleted = stats?.todayCompleted || 0;
  const remainingTasks = stats?.remainingTasks || 0;
  const progressPercentage = dailyLimit > 0 ? (todayCompleted / dailyLimit) * 100 : 0;

  // Check if user needs to purchase a level
  const needsLevelPurchase = !currentLevelName || 
    userLevel?.currentLevelNumber === -1 || 
    requiresLevelPurchase;

  // Show level purchase prompt
  if (needsLevelPurchase) {
    return (
      <Flex className={classes.taskContainer} direction="column">
        <Flex className={classes.taskInfoBox} direction="column">
          <Flex align="center" justify="space-between" mb="md">
            <Text size="xl" fw={700}>
              No Active Level
            </Text>
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: "red", to: "orange" }}
            >
              Level Required
            </Badge>
          </Flex>
        </Flex>

        <Flex
          direction="column"
          justify="center"
          align="center"
          style={{ flex: 1, padding: "2rem" }}
          gap="lg"
        >
          <ShoppingCart size={64} color="#868e96" />
          <Text size="xl" fw={600} ta="center">
            Purchase a Level to Access Tasks
          </Text>
          <Text size="sm" c="dimmed" ta="center" maw={400}>
            You need to purchase a level before you can start completing tasks and earning rewards.
          </Text>
          <Button
            size="lg"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            onClick={handlePurchaseLevel}
            leftSection={<ShoppingCart size={20} />}
          >
            Browse Levels
          </Button>
        </Flex>
      </Flex>
    );
  }

  // Error state (but not 403 which we handle above)
  if (isError && !requiresLevelPurchase) {
    return (
      <Flex justify="center" align="center" h="100vh" p="md">
        <Alert color="red" title="Error Loading Tasks" maw={500}>
          <Text size="sm" mb="md">
            {"Failed to load tasks. Please try again later."}
          </Text>
          <Button onClick={() => window.location.reload()} variant="light">
            Retry
          </Button>
        </Alert>
      </Flex>
    );
  }

  return (
    <Flex className={classes.taskContainer} direction="column">
      <Flex className={classes.taskInfoBox} direction="column">
        <Flex align="center" justify="space-between" mb="md">
          <Text size="xl" fw={700}>
            {currentLevelName || "No Level"}
          </Text>
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            {userLevel?.currentLevelNumber >= 0 
              ? `Level ${userLevel.currentLevelNumber}` 
              : "No Level"}
          </Badge>
        </Flex>

        <Box mb="md">
          <Flex justify="space-between" align="center" mb="xs">
            <Flex align="center" gap="xs">
              <Target size={18} />
              <Text size="sm" fw={500}>
                Daily Progress
              </Text>
            </Flex>
            <Text size="sm" fw={600}>
              {todayCompleted} / {totalTasks}
            </Text>
          </Flex>
          <Progress value={progressPercentage} size="lg" radius="xl" />
        </Box>

        <Flex gap="md" wrap="wrap">
          <Flex direction="column" style={{ flex: 1, minWidth: "45%" }}>
            <Flex align="center" gap="xs" mb="xs">
              <CheckCircle size={16} />
              <Text size="xs">Completed Today</Text>
            </Flex>
            <Text size="lg" fw={700}>
              {todayCompleted}
            </Text>
          </Flex>

          <Flex direction="column" style={{ flex: 1, minWidth: "45%" }}>
            <Flex align="center" gap="xs" mb="xs">
              <Trophy size={16} />
              <Text size="xs">Tasks Remaining</Text>
            </Flex>
            <Text size="lg" fw={700}>
              {remainingTasks}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Task List */}
      <Flex direction="column" className={classes.taskItemContainer}>
        {allTasks.length === 0 ? (
          <Flex
            direction="column"
            justify="center"
            align="center"
            flex={1}
            gap="md"
            p="xl"
          >
            <Text size="lg" c="gray" ta="center">
              No tasks available at the moment
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Check back later for new tasks or upgrade your level
            </Text>
            <Button
              variant="light"
              onClick={handlePurchaseLevel}
              mt="md"
            >
              Upgrade Level
            </Button>
          </Flex>
        ) : (
          allTasks.map((task: any, index: number) => {
            // Skip invalid tasks
            if (!task || !task._id || !task.thumbnail) {
              return null;
            }

            const taskElement = (
              <TaskItem
                key={task._id}
                thumbnail={task.thumbnail}
                level={task.level || "Unknown"}
                reward={`Rs +${task.rewardPrice || 0}`}
                isCompleted={task.isCompleted || false}
                onClick={() => handleTaskClick(task._id, task.isCompleted)}
              />
            );

            if (index === allTasks.length - 1) {
              return (
                <div ref={lastTaskRef} key={task._id}>
                  {taskElement}
                </div>
              );
            }
            return taskElement;
          })
        )}
        {isFetchingNextPage && (
          <Flex justify="center" align="center" mt="md">
            <Loader size="sm" />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Task;