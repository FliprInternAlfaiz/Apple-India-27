import React, { useRef, useCallback } from "react";
import { Flex, Text, Loader } from "@mantine/core";
import classes from "./Task.module.scss";
import TaskItem from "../../components/TaskItem/TaskItem";
import { useInfiniteTasksQuery } from "../../hooks/query/useGetTask.query";

const Task: React.FC = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteTasksQuery({ level: "Apple4", limit: 4 });

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
  const totalTasks = data?.pages[0]?.pagination?.totalTasks || 0;

  return (
    <Flex className={classes.taskContainer} direction="column">
      <Flex className={classes.taskInfoBox} direction="column">
        <Text size="xl" fw={700} mb="md">
          Apple4
        </Text>
        <Text size="md" fw={500} mb="xs">
          Tasks remaining today: {totalTasks}
        </Text>
        <Text size="md" fw={500}>
          Tasks completed today: 0
        </Text>
      </Flex>

      <Flex direction="column" className={classes.taskItemContainer}>
        {allTasks.length === 0 ? (
          <Flex justify="center" align="center" flex={1}>
            <Text color="gray">No tasks available</Text>
          </Flex>
        ) : (
          allTasks.map((task: any, index: number) => {
            if (index === allTasks.length - 1) {
              return (
                <div ref={lastTaskRef} key={task._id}>
                  <TaskItem
                    thumbnail={task.thumbnail}
                    level={task.level}
                    reward={`Rs +${task.rewardPrice}`}
                  />
                </div>
              );
            }
            return (
              <TaskItem
                key={task._id}
                thumbnail={task.thumbnail}
                level={task.level}
                reward={`Rs +${task.rewardPrice}`}
              />
            );
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
