import React, { useRef, useCallback } from "react";
import { Flex, Text, Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import classes from "./Task.module.scss";
import TaskItem from "../../components/TaskItem/TaskItem";
import { useInfiniteTasksQuery } from "../../hooks/query/useGetTask.query";

const Task: React.FC = () => {
  const navigate = useNavigate();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteTasksQuery({ level: "Apple1", limit: 4 });

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
        <Text c="red">Failed to load tasks.</Text>
      </Flex>
    );
  }

  const allTasks = data?.pages.flatMap((page) => page.tasks) || [];
  const stats = data?.pages[0]?.stats;
  const totalTasks = data?.pages[0]?.pagination?.totalTasks || 0;

  return (
    <Flex className={classes.taskContainer} direction="column">
      <Flex className={classes.taskInfoBox} direction="column">
        <Text size="xl" fw={700} mb="md">
          Apple4
        </Text>
        <Text size="md" fw={500} mb="xs">
          Tasks remaining today: {totalTasks - (stats?.todayCompleted || 0)}
        </Text>
        <Text size="md" fw={500}>
          Tasks completed today: {stats?.todayCompleted || 0}
        </Text>
      </Flex>

      <Flex direction="column" className={classes.taskItemContainer}>
        {allTasks.length === 0 ? (
          <Flex justify="center" align="center" flex={1}>
            <Text c="gray">No tasks available</Text>
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