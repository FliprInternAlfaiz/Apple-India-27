import React from "react";
import { Flex, Text } from "@mantine/core";
import classes from "../../pages/task/Task.module.scss";

interface TaskItemProps {
  thumbnail: string;
  level: string;
  reward: string;
  hasPlayButton?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  thumbnail,
  level,
  reward,
  hasPlayButton = true,
}) => (
  <Flex className={classes.taskItem}>
    <Flex className={classes.thumbnailWrapper}>
      <img src={thumbnail} alt="Task thumbnail" />
      {hasPlayButton && (
        <Flex className={classes.playButton}>
          <Flex className={classes.triangle} />
        </Flex>
      )}
    </Flex>

    <Flex className={classes.taskDetails} direction="column">
      <Flex className={classes.levelBox}>
        <Text size="sm" fw={600}>{level}</Text>
      </Flex>
      <Text size="md" fw={400} className={classes.rewardText}>
        Reward price: <span>{reward}</span>
      </Text>
    </Flex>
  </Flex>
);

export default TaskItem;
