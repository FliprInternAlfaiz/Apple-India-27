import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Loader,
  Alert,
  Text,
  Card,
  Container,
  Flex,
  Button,
  Badge,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { FaStar } from "react-icons/fa";
import { Trophy} from "lucide-react";
import { notifications } from "@mantine/notifications";
import classes from "./LevelTasksScreen.module.scss";
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
        (l) => l.levelNumber === userLevel.currentLevelNumber
      );
      if (currentIndex !== -1) setActiveLevelIndex(currentIndex);
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

  if (isLoading)
    return (
      <Box ta="center" mih="400px" mt="xl">
        <Loader color="blue" size="lg" />
      </Box>
    );

  if (isError)
    return (
      <Alert color="red" title="Error">
        Failed to load levels. Please try again later.
      </Alert>
    );

  if (!currentLevel)
    return (
      <Alert color="blue" title="Info">
        No levels available.
      </Alert>
    );

  const progressPercentage =
    currentLevel.dailyTaskLimit > 0
      ? (currentLevel.completed / currentLevel.dailyTaskLimit) * 100
      : 0;

  return (
    <div className={classes.screen}>
      {/* ✅ Carousel Section */}
      <Container className={classes.carouselContainer}>
        <Carousel
          withControls
          slideSize="100%"
          slideGap="md"
          onSlideChange={setActiveLevelIndex}
          emblaOptions={{ loop: true, align: "start" }}
        >
          {levels.map((level, idx) => {
            const slideProgress =
              level.dailyTaskLimit > 0
                ? (level.completed / level.dailyTaskLimit) * 100
                : 0;

            return (
              <Carousel.Slide key={level._id}>
                <Card className={classes.levelCard} shadow="md" radius="lg" withBorder>
                  <Flex align="center" gap="xs" mb="md">
                    <span>{level.icon || "🏅"}</span>
                    <Text size="lg" fw={600}>
                      {level.level}
                    </Text>
                    {level.isCurrent && <Badge color="green">Current</Badge>}
                    {!level.isUnlocked && <Badge color="red">Locked</Badge>}
                  </Flex>

                  <Flex justify="space-between" align="flex-end">
                    <Flex direction="column">
                      <Text size="sm" fw={500} mb="xs">
                        Remaining tasks: {level.remaining}
                      </Text>
                      <Text size="sm" fw={500}>
                        Completed tasks: {level.completed}
                      </Text>
                    </Flex>
                    <Box className={classes.targetBox}>
                      <Text size="sm" fw={500}>
                        Target amount
                      </Text>
                      <Text size="md" fw={700}>
                        ₹{level.target.toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>

                  <Box className={classes.progressBar}>
                    <Box
                      className={classes.progressFill}
                      style={{ width: `${slideProgress}%` }}
                    />
                  </Box>
                </Card>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Container>

      {/* ✅ Level Indicators */}
      <Box mt="xl">
        <Carousel
          withControls={false}
          slideSize={{ base: "20%", sm: "15%" }}
          height={80}
          emblaOptions={{ loop: true, align: "center" }}
          slideGap="sm"
          draggable
        >
          {levels.map((level, index) => (
            <Carousel.Slide key={level._id}>
              <Box
                onClick={() => setActiveLevelIndex(index)}
                className={`${classes.levelIndicator} ${
                  activeLevelIndex === index ? classes.activeIndicator : ""
                }`}
              >
                {activeLevelIndex === index ? (
                  <FaStar size={16} />
                ) : (
                  <span className={classes.inactiveDot} />
                )}
                <Text fz="xs">{level.level}</Text>
              </Box>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      {/* ✅ Details Section */}
      <Box className={classes.detailsSection}>
        <Flex className={classes.levelTitleWrapper}>
          <Text size="md" fw={700}>
            {currentLevel.level}
          </Text>
        </Flex>

        <Text size="sm" fw={500} className={classes.sectionSubtitle}>
          Number of promotion tasks and commission income per day
        </Text>

        <div className={classes.tableContainer}>
          <Flex justify="space-between" className={classes.tableHeader}>
            <Text size="sm" fw={700} className={classes.flex2}>
              Time unit
            </Text>
            <Text size="sm" fw={700} className={classes.flex1Center}>
              Number of tasks
            </Text>
            <Text size="sm" fw={700} className={classes.flex1Right}>
              Total commission
            </Text>
          </Flex>

          <Flex
            justify="space-between"
            className={`${classes.tableRow} ${classes.tableRowBorder}`}
          >
            <Text size="xs" fw={600} className={classes.flex2}>
              Daily
            </Text>
            <Text size="xs" fw={600} className={classes.flex1Center}>
              {currentLevel.dailyTaskLimit}
            </Text>
            <Text size="xs" fw={600} className={classes.flex1Right}>
              ₹{currentLevel.commission}
            </Text>
          </Flex>
        </div>

        <Text size="sm" fw={500} className={classes.sectionSubtitle}>
          Invitation commission profit margin
        </Text>

        <div className={classes.tableContainer}>
          <Flex justify="space-between" className={classes.tableHeader}>
            <Text size="xs" fw={700} className={classes.flex2}>
              Invitation Method
            </Text>
            <Text size="xs" fw={700} className={classes.flex1Center}>
              Rate
            </Text>
            <Text size="xs" fw={700} className={classes.flex1Right}>
              Income amount
            </Text>
          </Flex>
          {currentLevel.invitations.map((inv, index) => (
            <Flex
              key={index}
              justify="space-between"
              className={`${classes.tableRow} ${
                index < currentLevel.invitations.length - 1
                  ? classes.tableRowBorder
                  : ""
              }`}
            >
              <Text size="xs" className={classes.flex2}>
                {inv.method}
              </Text>
              <Text size="xs" fw={600} className={classes.flex1Center}>
                {inv.rate}
              </Text>
              <Text size="xs" fw={600} className={classes.flex1Right}>
                ₹{inv.amount}
              </Text>
            </Flex>
          ))}
        </div>

        {!currentLevel.isUnlocked && (
          <Button
            fullWidth
            mt="md"
            color="blue"
            loading={upgradeMutation.isPending}
            onClick={() => handleUpgrade(currentLevel.levelNumber)}
          >
            Upgrade to {currentLevel.level}
          </Button>
        )}

        <Flex align="center" justify="center" mt="lg" gap="xs">
          <Trophy size={18} color="green" />
          <Text size="sm" c="green">
            Daily Earnings: ₹{currentLevel.rewardPerTask} per task
          </Text>
        </Flex>
      </Box>
    </div>
  );
};

export default LevelTasksScreen;
