import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flex, Text, Loader, Button, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useTaskQuery,
  useCompleteTaskMutation,
} from "../../hooks/query/useGetTask.query";
import classes from "./VideoPlayerScreen.module.scss";
import { FiX, FiCheck, FiArrowLeft } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";

const VideoPlayerScreen: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoWatched, setVideoWatched] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
console.log("watchProgress",watchProgress);
  const { data, isLoading, isError, error } = useTaskQuery(taskId!);

  const completeMutation = useCompleteTaskMutation();

  const task = data?.task;

  useEffect(() => {
    const video = videoRef.current;
    console.log(video)
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setWatchProgress(progress);

      if (progress >= 90 && !videoWatched) {
        setVideoWatched(true);
      }
    };

    const handleEnded = () => {
      setVideoWatched(true);
      setWatchProgress(100);
    };

    let lastTime = 0;
    const handleSeeking = () => {
      if (video.currentTime > lastTime + 0.5) {
        video.currentTime = lastTime;
      }
    };

    const handlePlay = () => {
      lastTime = video.currentTime;
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("play", handlePlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("play", handlePlay);
    };
  }, [videoWatched]);

  const handleClaimReward = async () => {
    if (!taskId) return;

    try {
      const result = await completeMutation.mutateAsync(taskId);

      if (result.status === "success") {
        setShowRewardModal(true);

        notifications.show({
          title: "Reward Earned! 🎉",
          message: `Rs ${result.rewardAmount} added to your wallet`,
          color: "green",
          icon: <FiCheck size={18} />,
          autoClose: 5000,
        });
      }
    } catch (err: any) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to claim reward",
        color: "red",
        icon: <FiX size={18} />,
      });
    }
  };

  const handleCloseRewardModal = () => {
    setShowRewardModal(false);
    navigate("/tasks");
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh" direction="column">
        <Loader size="lg" />
        <Text mt="md" size="sm" c="dimmed">
          Loading video...
        </Text>
      </Flex>
    );
  }

  if (isError || !task) {
    return (
      <Flex justify="center" align="center" h="100vh" direction="column">
        <FiX size={48} color="red" />
        <Text c="red" mt="md">
          {error instanceof Error ? error.message : "Failed to load task"}
        </Text>
        <Button mt="lg" onClick={() => navigate("/tasks")}>
          Go Back
        </Button>
      </Flex>
    );
  }

  if (task.isCompleted) {
    return (
      <Flex justify="center" align="center" h="100vh" direction="column" p="lg">
        <div className={classes.completedIcon}>
          <FiCheck size={64} color="white" />
        </div>
        <Text size="xl" fw={700} mt="xl">
          Task Already Completed
        </Text>
        <Text size="md" c="dimmed" mt="xs" ta="center">
          You have already earned the reward for this task
        </Text>
        <Button
          mt="xl"
          size="lg"
          onClick={() => navigate("/tasks")}
          leftSection={<FiArrowLeft size={20} />}
        >
          Back to Tasks
        </Button>
      </Flex>
    );
  }

  const rewardData = completeMutation.data;

  return (
    <Flex className={classes.videoPlayerContainer} direction="column">
      <Flex className={classes.header}>
        <Button
          variant="subtle"
          color="gray"
          onClick={() => navigate("/tasks")}
          leftSection={<FiArrowLeft size={20} />}
        >
          Back
        </Button>
        <Text size="lg" fw={600}>
          {task.level}
        </Text>
        <div style={{ width: 80 }} />
      </Flex>

      {task?.videoUrl && (
        <video
          ref={videoRef}
          className={classes.videoPlayer}
          controls
         controlsList="nodownload nofullscreen noremoteplayback"
          playsInline
          poster={task.thumbnail}
          preload="metadata"
        >
          <source src={task.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <Flex className={classes.progressSection} direction="column" p="md">
        <Flex justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Watch Progress
          </Text>
          <Text size="sm" fw={600} c={videoWatched ? "green" : "blue"}>
            {Math.round(watchProgress)}%
          </Text>
        </Flex>
        <div className={classes.progressBar}>
          <div
            className={classes.progressFill}
            style={{ width: `${watchProgress}%` }}
          />
        </div>
        {videoWatched && (
          <Flex align="center" gap="xs" mt="xs">
            <FiCheck size={16} color="green" />
            <Text size="xs" c="green" fw={500}>
              Video completed! You can claim your reward now.
            </Text>
          </Flex>
        )}
      </Flex>

      <Flex className={classes.rewardSection} direction="column" p="lg">
        <Flex className={classes.rewardCard} direction="column" p="lg">
          <Flex align="center" justify="center" mb="md">
            <FaCoins size={48} className={classes.coinIcon} />
          </Flex>
          <Text size="xl" fw={700} ta="center" mb="xs">
            Rs {task.rewardPrice}
          </Text>
          <Text size="sm" c="dimmed" ta="center" mb="lg">
            {videoWatched
              ? "Great job! Click below to claim your reward"
              : "Complete watching to claim your reward"}
          </Text>

          <Button
            size="lg"
            fullWidth
            disabled={!videoWatched || completeMutation.isPending}
            loading={completeMutation.isPending}
            onClick={handleClaimReward}
            leftSection={<FiCheck size={20} />}
            className={classes.claimButton}
          >
            {videoWatched ? "Claim Reward" : "Watch to Unlock"}
          </Button>

          {!videoWatched && (
            <Text size="xs" c="dimmed" ta="center" mt="sm">
              Watch at least 90% of the video to claim
            </Text>
          )}
        </Flex>
      </Flex>

      <Modal
        opened={showRewardModal}
        onClose={handleCloseRewardModal}
        centered
        withCloseButton={false}
        size="sm"
        padding={0}
      >
        <Flex
          direction="column"
          align="center"
          p="xl"
          className={classes.modalContent}
        >
          <div className={classes.successIconWrapper}>
            <div className={classes.successIcon}>
              <FiCheck size={48} color="white" strokeWidth={3} />
            </div>
          </div>

          <Text size="xl" fw={700} mt="xl" ta="center">
            Congratulations! 🎉
          </Text>

          <div className={classes.rewardAmount}>
            <Text size="md" c="dimmed" mb={4}>
              Reward Earned
            </Text>
            <Text size="2rem" fw={700} c="green">
              +Rs {rewardData?.rewardAmount}
            </Text>
          </div>

          <Text size="sm" c="dimmed" ta="center" mb="xl">
            Reward has been credited to your wallet
          </Text>

          <Flex className={classes.statsGrid} w="100%" gap="md" mb="xl">
            <Flex
              direction="column"
              align="center"
              className={classes.statItem}
            >
              <Text size="xs" c="dimmed" mb={4}>
                New Balance
              </Text>
              <Text size="lg" fw={600} c="blue">
                Rs {rewardData?.newBalance}
              </Text>
            </Flex>
            <div className={classes.divider} />
            <Flex
              direction="column"
              align="center"
              className={classes.statItem}
            >
              <Text size="xs" c="dimmed" mb={4}>
                Tasks Today
              </Text>
              <Text size="lg" fw={600} c="violet">
                {rewardData?.todayTasksCompleted}
              </Text>
            </Flex>
            <div className={classes.divider} />
            <Flex
              direction="column"
              align="center"
              className={classes.statItem}
            >
              <Text size="xs" c="dimmed" mb={4}>
                Total Tasks
              </Text>
              <Text size="lg" fw={600} c="orange">
                {rewardData?.totalTasksCompleted}
              </Text>
            </Flex>
          </Flex>

          <Button
            size="lg"
            fullWidth
            onClick={handleCloseRewardModal}
            className={classes.continueButton}
          >
            Continue
          </Button>
        </Flex>
      </Modal>
    </Flex>
  );
};

export default VideoPlayerScreen;
