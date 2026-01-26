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
  Modal,
  Center,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { FaStar } from "react-icons/fa";
import { Trophy, AlertCircle } from "lucide-react";
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
  canPurchase: boolean;
  icon: string;
  description: string;
  invitations: Invitation[];
}

interface UserLevel {
  currentLevel: string;
  currentLevelNumber: number;
  todayTasksCompleted: number;
  mainWallet: number;
  investmentAmount: number;
}

const LevelTasksScreen: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetAllLevelsQuery();
  const levels: Level[] = data?.levels ?? [];
  const fetchedUserLevel: UserLevel | null = data?.userLevel ?? null;
  const upgradeMutation = useUpgradeUserLevelMutation();

  const [activeLevelIndex, setActiveLevelIndex] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

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

  const canUserPurchase = (level: Level) => {
    if (!userLevel) return false;
    if (level.isCurrent || level.isUnlocked) return false;
    return userLevel.mainWallet >= level.target;
  };

  const handlePurchaseClick = (level: Level) => {
    setSelectedLevel(level);
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedLevel) return;

    try {
      await upgradeMutation.mutateAsync({
        newLevelNumber: selectedLevel.levelNumber,
      });
      setShowPurchaseModal(false);
      setSelectedLevel(null);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading)
    return (
      <Center h="100vh">
        <Loader color="2d1b4e" size="lg" />
      </Center>
    );

  if (isError)
    return (
      <Alert color="red" title="Error">
        Failed to load levels. Please try again later.
      </Alert>
    );

  if (!currentLevel)
    return (
      <Alert color="2d1b4e" title="Info">
        No levels available.
      </Alert>
    );

  return (
    <div className={classes.screen}>
      <Container className={classes.carouselContainer}>
        <Carousel
          withControls
          slideSize="100%"
          slideGap="md"
          onSlideChange={setActiveLevelIndex}
          emblaOptions={{ loop: true, align: "start" }}
        >
          {levels.map((level) => {
            return (
              <Carousel.Slide key={level._id}>
                <Card
                  className={classes.levelCard}
                  shadow="md"
                  radius="lg"
                  withBorder
                >
                  <Flex align="center" gap="xs" mb="md">
                    <span style={{ fontSize: "2rem" }}>
                      {level.icon || "🏅"}
                    </span>
                    <Text size="lg" fw={600}>
                      {level.level}
                    </Text>
                    {level.isCurrent && <Badge color="green">Current</Badge>}
                    {!level.isUnlocked && <Badge color="red">Locked</Badge>}
                    {canUserPurchase(level) && <Badge color="#2d1b4e">Available</Badge>}
                  </Flex>

                  <Flex justify="space-between" align="flex-end" mb="md">
                    <Flex direction="column">
                      <Text size="sm" fw={500} mb="xs">
                        Daily Tasks: {level.dailyTaskLimit}
                      </Text>
                      <Text size="sm" fw={500} c="green">
                        Reward: ₹{level.rewardPerTask} per task
                      </Text>
                    </Flex>
                    <Box className={classes.targetBox}>
                      <Text size="sm" fw={500}>
                        Investment Required
                      </Text>
                      <Text size="md" fw={700}>
                        ₹{level.target.toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>
                </Card>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Container>

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
                className={`${classes.levelIndicator} ${activeLevelIndex === index ? classes.activeIndicator : ""
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

      {/* Details Section */}
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
              {currentLevel.commission}
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
              className={`${classes.tableRow} ${index < currentLevel.invitations.length - 1
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

        {/* Purchase Button */}
        {!currentLevel.isUnlocked && canUserPurchase(currentLevel) && userLevel && (
          <Button
            fullWidth
            mt="md"
            color="#2d1b4e"
            size="lg"
            loading={upgradeMutation.isPending}
            onClick={() => handlePurchaseClick(currentLevel)}
            leftSection={<Trophy size={20} />}
          >
            Purchase {currentLevel.level} - ₹
            {currentLevel.target.toLocaleString()}
          </Button>
        )}

        {!currentLevel.isUnlocked && !canUserPurchase(currentLevel) && (
          <Alert icon={<AlertCircle size={16} />} color="orange" mt="md">
            {userLevel && userLevel.mainWallet < currentLevel.target
              ? `Insufficient balance. You need ₹${(
                currentLevel.target - userLevel.mainWallet
              ).toLocaleString()} more. Please Recharge`
              : "Level already unlocked or current."}
          </Alert>
        )}

        <Flex align="center" justify="center" mt="lg" gap="xs">
          <Trophy size={18} color="green" />
          <Text size="sm" c="green">
            Daily Earnings: ₹{currentLevel.rewardPerTask} per task ×{" "}
            {currentLevel.dailyTaskLimit} tasks = ₹
            {currentLevel.rewardPerTask * currentLevel.dailyTaskLimit}
          </Text>
        </Flex>
      </Box>

      {/* Purchase Confirmation Modal */}
      <Modal
        opened={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Confirm Level Purchase"
        centered
      >
        {selectedLevel && userLevel && (
          <Box>
            <Text size="sm" mb="md">
              You are about to purchase <strong>{selectedLevel.level}</strong>
            </Text>

            <Flex direction="column" gap="sm" mb="lg">
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Investment Amount:
                </Text>
                <Text size="sm" fw={600}>
                  ₹{selectedLevel.target.toLocaleString()}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Current Balance:
                </Text>
                <Text size="sm" fw={600}>
                  ₹{userLevel.mainWallet.toLocaleString()}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text size="sm" c="dimmed">
                  Balance After Purchase:
                </Text>
                <Text
                  size="sm"
                  fw={600}
                  c={
                    userLevel.mainWallet - selectedLevel.target >= 0
                      ? "green"
                      : "red"
                  }
                >
                  ₹
                  {(
                    userLevel.mainWallet - selectedLevel.target
                  ).toLocaleString()}
                </Text>
              </Flex>
              <Box
                mt="sm"
                p="sm"
                style={{ background: "#e7f5ff", borderRadius: "8px" }}
              >
                <Text size="sm" fw={500} mb="xs">
                  Benefits:
                </Text>
                <Text size="xs">
                  • Daily tasks: {selectedLevel.dailyTaskLimit}
                </Text>
                <Text size="xs">
                  • Reward per task: ₹{selectedLevel.rewardPerTask}
                </Text>
                <Text size="xs">
                  • Max daily earnings: ₹
                  {selectedLevel.rewardPerTask * selectedLevel.dailyTaskLimit}
                </Text>
              </Box>
            </Flex>

            <Flex gap="sm">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowPurchaseModal(false)}
                color="#2d1b4e"
              >
                Cancel
              </Button>
              <Button
                fullWidth
                color="#2d1b4e"
                loading={upgradeMutation.isPending}
                onClick={handleConfirmPurchase}
              >
                Confirm Purchase
              </Button>
            </Flex>
          </Box>
        )}
      </Modal>
    </div>
  );
};

export default LevelTasksScreen;
