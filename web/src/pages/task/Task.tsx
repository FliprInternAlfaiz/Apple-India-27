import React from "react";
import { Flex, Text } from "@mantine/core";
import classes from "./Task.module.scss";
import TaskItem from "../../components/TaskItem/TaskItem";

const Task: React.FC = () => {
  const tasks = [
    {
      id: 1,
      thumbnail: "https://picsum.photos/id/1/200/300",
      level: "LG4",
      reward: "Rs +185.00",
    },
    {
      id: 2,
      thumbnail: "https://picsum.photos/id/10/200/300",
      level: "LG4",
      reward: "Rs +185.00",
    },
    {
      id: 3,
      thumbnail: "https://picsum.photos/id/12/200/300",
      level: "LG4",
      reward: "Rs +185.00",
    },
    {
      id: 4,
      thumbnail: "https://picsum.photos/id/14/200/300",
      level: "LG4",
      reward: "Rs +185.00",
    },
  ];

  return (
    <Flex className={classes.taskContainer} direction="column">
      <Flex className={classes.taskInfoBox} direction="column" >
        <Text size="xl" fw={700} mb="md">LG4</Text>
        <Text size="md" fw={500} mb="xs">Tasks remaining today: 0</Text>
        <Text size="md" fw={500}>Tasks completed today: 20</Text>
      </Flex>

      <Flex direction="column"  className={classes.taskItemContainer}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            thumbnail={task.thumbnail}
            level={task.level}
            reward={task.reward}
          />
        ))}
      </Flex>
    </Flex>
  );
};

export default Task;
