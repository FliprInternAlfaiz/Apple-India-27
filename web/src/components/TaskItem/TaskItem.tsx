// components/TaskItem/TaskItem.tsx
import React from "react";
import { Flex, Text, Badge } from "@mantine/core";
import classes from "../../pages/task/Task.module.scss";
import { FaCheckCircle } from "react-icons/fa";

interface TaskItemProps {
  thumbnail: string;
  level: string;
  reward: string;
  isCompleted?: boolean;
  hasPlayButton?: boolean;
  onClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  thumbnail,
  level,
  reward,
  isCompleted = false,
  hasPlayButton = true,
  onClick,
}) => (
  <Flex
    className={`${classes.taskItem} ${isCompleted ? classes.completed : ""}`}
    onClick={onClick}
    style={{
      cursor: isCompleted ? "not-allowed" : "pointer",
      opacity: isCompleted ? 0.6 : 1,
      position: "relative",
    }}
  >
    <Flex className={classes.thumbnailWrapper}>
      <img src={thumbnail} alt="Task thumbnail" />
      {!isCompleted && hasPlayButton && (
        <Flex className={classes.playButton}>
          <Flex className={classes.triangle} />
        </Flex>
      )}
      {isCompleted && (
        <Flex className={classes.completedBadge}>
          <FaCheckCircle size={24} color="white" />
        </Flex>
      )}
    </Flex>

    <Flex className={classes.taskDetails} direction="column">
      <Flex className={classes.levelBox} align="center" gap="xs">
        <Text size="sm" fw={600}>
          {level}
        </Text>
        {isCompleted && (
          <Badge color="green" size="sm" variant="filled">
            Completed
          </Badge>
        )}
      </Flex>
      <Text size="md" fw={400} className={classes.rewardText}>
        Reward price: <span>{reward}</span>
      </Text>
    </Flex>
  </Flex>
);

export default TaskItem;