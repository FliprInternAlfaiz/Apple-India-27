import React, { useRef, useCallback, useEffect, useState } from "react";
import { Flex, Text, Loader, Alert, Badge, Box, Progress } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { Trophy, Target, CheckCircle } from "lucide-react";
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
      setUserLevel(JSON.parse(storedLevel));
    }
  }, []);

  const currentLevelName = userLevel?.currentLevel || "Apple1";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteTasksQuery({ level: currentLevelName, limit: 10 });

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

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Loader size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Alert color="red" title="Error">
          Failed to load tasks. Please try again later.
        </Alert>
      </Flex>
    );
  }

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const stats = data?.pages[0]?.stats;
  const totalTasks = data?.pages[0]?.pagination?.totalTasks || 0;

  const dailyLimit = stats?.dailyLimit || 0;
  const todayCompleted = stats?.todayCompleted || 0;
  const remainingTasks = stats?.remainingTasks || 0;
  const progressPercentage =
    dailyLimit > 0 ? (todayCompleted / dailyLimit) * 100 : 0;

  const limitReached = stats?.limitReached || todayCompleted >= dailyLimit;

  return (
    <Flex className={classes.taskContainer} direction="column">
      <Flex className={classes.taskInfoBox} direction="column">
        <Flex align="center" justify="space-between" mb="md">
          <Text size="xl" fw={700}>
            {currentLevelName}
          </Text>
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            Level {userLevel?.currentLevelNumber || 1}
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

        {limitReached && (
          <Alert
            color="teal"
            mt="md"
            icon={<CheckCircle size={16} color="#00b894" />}
            style={{ background: "#55efc4", color: "#2d3436", fontWeight: 500 }}
          >
            🎉 Daily task limit reached! Come back tomorrow for more tasks.
          </Alert>
        )}
      </Flex>

      {/* Task List */}
      <Flex direction="column" className={classes.taskItemContainer}>
        {limitReached ? (
          <Flex
            direction="column"
            justify="center"
            align="center"
            flex={1}
            gap="md"
            style={{ padding: "2rem" }}
          >
            <Trophy size={64} color="#40c057" />
            <Text size="xl" fw={700} ta="center">
              All Tasks Completed!
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              You've completed all {dailyLimit} tasks for today.
              <br />
              Come back tomorrow to continue earning.
            </Text>
          </Flex>
        ) : allTasks.length === 0 ? (
          <Flex
            direction="column"
            justify="center"
            align="center"
            flex={1}
            gap="md"
          >
            <Text size="lg" c="gray" ta="center">
              No tasks available for {currentLevelName}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Check back later for new tasks
            </Text>
          </Flex>
        ) : (
          allTasks.map((task: any, index: number) => {
            const taskElement = (
              <TaskItem
                key={task._id}
                thumbnail={task.thumbnail}
                level={task.level}
                reward={`Rs +${task.rewardPrice}`}
                isCompleted={task.isCompleted}
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
