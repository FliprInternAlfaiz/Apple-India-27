import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flex, Text, Loader, Button, Modal, Progress } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useTaskQuery,
  useCompleteTaskMutation,
} from "../../hooks/query/useGetTask.query";
import classes from "./VideoPlayerScreen.module.scss";
import { FiX, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { FaCoins, FaPlay } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";

const VideoPlayerScreen: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoWatched, setVideoWatched] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  const watchedSegmentsRef = useRef<Set<number>>(new Set());
  const hasAutoRewardedRef = useRef(false);

  const { data, isLoading, isError, error } = useTaskQuery(taskId!);
  const completeMutation = useCompleteTaskMutation();

  const task = data?.task;

  const handleAutoReward = useCallback(async () => {
    if (!taskId || videoWatched || isProcessingReward) {
      return;
    }

    setIsProcessingReward(true);
    setVideoWatched(true);

    try {
      const result = await completeMutation.mutateAsync(taskId);

      if (result.status === "success") {
        setTimeout(() => {
          setShowRewardModal(true);
        }, 500);

        notifications.show({
          title: "🎉 Congratulations!",
          message: `You've earned Rs ${result.rewardAmount}`,
          color: "green",
          icon: <BsCheckCircleFill size={18} />,
          autoClose: 5000,
        });
      }
    } catch (err: any) {
      console.error("Error claiming reward:", err);
      setVideoWatched(false);
      setIsProcessingReward(false);
      hasAutoRewardedRef.current = false;

      notifications.show({
        title: "Error",
        message: err.message || "Failed to process reward",
        color: "red",
        icon: <FiX size={18} />,
      });
    }
  }, [taskId, videoWatched, isProcessingReward, completeMutation]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    let lastTime = 0;

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded - Duration:", video.duration);
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;

      if (!duration || isNaN(duration)) {
        return;
      }

      const segmentIndex = Math.floor(currentTime / 5);
      watchedSegmentsRef.current.add(segmentIndex);

      const totalSegments = Math.ceil(duration / 5);
      const watchedCount = watchedSegmentsRef.current.size;
      const watchedPercentage = (watchedCount / totalSegments) * 100;

      setWatchProgress(Math.min(watchedPercentage, 100));
      lastTime = currentTime;

      if (watchedPercentage >= 5 && !hasAutoRewardedRef.current) {
        hasAutoRewardedRef.current = true;
        handleAutoReward();
      }
    };

    const handleEnded = () => {
      if (!hasAutoRewardedRef.current) {
        hasAutoRewardedRef.current = true;
        handleAutoReward();
      }
    };

    const handleSeeking = () => {
      if (video.currentTime > lastTime + 1.5) {
        video.currentTime = lastTime;
        notifications.show({
          title: "Cannot Skip Forward",
          message: "Please watch the video without skipping",
          color: "orange",
          icon: <FiAlertCircle size={18} />,
          autoClose: 3000,
        });
      }
    };

    const handlePlay = () => {
      setHasStartedWatching(true);
      lastTime = video.currentTime;
    };

    const handlePause = () => {
      console.log("⏸️ Video paused");
    };

    const handleRateChange = () => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
        notifications.show({
          title: "Playback Speed Locked",
          message: "Please watch at normal speed",
          color: "orange",
          icon: <FiAlertCircle size={18} />,
          autoClose: 3000,
        });
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ratechange", handleRateChange);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ratechange", handleRateChange);
    };
  }, [handleAutoReward]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        notifications.show({
          title: "Video Paused",
          message: "Stay on this tab to continue watching",
          color: "blue",
          icon: <FiAlertCircle size={18} />,
          autoClose: 3000,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleCloseRewardModal = () => {
    setShowRewardModal(false);
    navigate("/task");
  };

  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        h="100vh"
        direction="column"
        className={classes.loadingContainer}
      >
        <Loader size="xl" color="violet" />
        <Text mt="xl" size="lg" fw={500} c="white">
          Loading your video...
        </Text>
      </Flex>
    );
  }

  if (isError || !task) {
    return (
      <Flex
        justify="center"
        align="center"
        h="100vh"
        direction="column"
        p="lg"
        className={classes.errorContainer}
      >
        <div className={classes.errorIcon}>
          <FiX size={48} />
        </div>
        <Text size="xl" fw={700} mt="xl" c="white">
          Oops! Something went wrong
        </Text>
        <Text c="gray.3" mt="xs" ta="center">
          {error instanceof Error ? error.message : "Failed to load task"}
        </Text>
        <Button
          mt="xl"
          size="lg"
          onClick={() => navigate("/task")}
          leftSection={<FiArrowLeft size={20} />}
        >
          Back to Tasks
        </Button>
      </Flex>
    );
  }

  if (
    task.isCompleted &&
    !showRewardModal &&
    !videoWatched &&
    !hasAutoRewardedRef.current
  ) {
    return (
      <Flex
        justify="center"
        align="center"
        h="100vh"
        direction="column"
        p="lg"
        className={classes.completedContainer}
      >
        <div className={classes.completedIconLarge}>
          <BsCheckCircleFill size={80} />
        </div>
        <Text size="2rem" fw={700} mt="xl" c="white">
          Already Completed! ✨
        </Text>
        <Text size="lg" c="gray.3" mt="md" ta="center" maw={400}>
          You've already earned the reward for this task
        </Text>
        <Button
          mt="xl"
          size="lg"
          onClick={() => navigate("/task")}
          leftSection={<FiArrowLeft size={20} />}
          className={classes.backButton}
        >
          Browse More Tasks
        </Button>
      </Flex>
    );
  }

  const rewardData = completeMutation.data;
  const progressPercentage = Math.round(watchProgress);

  return (
    <div className={classes.videoPlayerContainer}>
      <div className={classes.header}>
        <Button
          variant="subtle"
          color="gray"
          onClick={() => navigate("/task")}
          leftSection={<FiArrowLeft size={20} />}
        >
          Back
        </Button>
        <Text size="lg" fw={700} c="violet">
          {task.level}
        </Text>
        <div className={classes.rewardBadge}>
          <FaCoins size={16} />
          <Text size="sm" fw={600}>
            Rs {task.rewardPrice}
          </Text>
        </div>
      </div>

      <div className={classes.videoSection}>
        <div className={classes.videoWrapper}>
          {task?.videoUrl && (
            <video
              ref={videoRef}
              className={classes.videoPlayer}
              controls
              controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              disablePictureInPicture
              playsInline
              poster={task.thumbnail}
              preload="metadata"
            >
              <source src={task.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className={classes.progressOverlay}>
          <div className={classes.progressCard}>
            <Flex justify="space-between" align="center" mb="md">
              <Flex align="center" gap="xs">
                {videoWatched ? (
                  <BsCheckCircleFill size={20} color="#4CAF50" />
                ) : hasStartedWatching ? (
                  <FaPlay size={16} color="#667eea" />
                ) : (
                  <FiAlertCircle size={20} color="#ffa726" />
                )}
                <Text size="md" fw={600}>
                  {videoWatched
                    ? "Completed!"
                    : hasStartedWatching
                    ? "Watching..."
                    : "Start Watching"}
                </Text>
              </Flex>
              <Text size="xl" fw={700} c={videoWatched ? "green" : "violet"}>
                {progressPercentage}%
              </Text>
            </Flex>

            <Progress
              value={progressPercentage}
              size="lg"
              radius="xl"
              className={classes.progressBar}
              color={videoWatched ? "green" : "violet"}
              animated={!videoWatched}
            />

            {videoWatched ? (
              <Flex
                align="center"
                gap="xs"
                mt="md"
                className={classes.successMessage}
              >
                <BsCheckCircleFill size={16} />
                <Text size="sm" fw={500}>
                  Processing your reward automatically...
                </Text>
              </Flex>
            ) : (
              <Text size="xs" c="dimmed" mt="md" ta="center">
                Watch at least 5% to earn your reward • No skipping allowed
              </Text>
            )}
          </div>
        </div>
      </div>

      {!hasStartedWatching && (
        <div className={classes.instructionsCard}>
          <Text size="lg" fw={700} mb="md" ta="center">
            📺 How to Earn Your Reward
          </Text>
          <Flex direction="column" gap="sm">
            <Flex align="center" gap="md">
              <div className={classes.stepNumber}>1</div>
              <Text size="sm">Watch the entire video without skipping</Text>
            </Flex>
            <Flex align="center" gap="md">
              <div className={classes.stepNumber}>2</div>
              <Text size="sm">Stay on this tab while watching</Text>
            </Flex>
            <Flex align="center" gap="md">
              <div className={classes.stepNumber}>3</div>
              <Text size="sm">Reward will be credited automatically</Text>
            </Flex>
          </Flex>
        </div>
      )}

      <Modal
        opened={showRewardModal}
        onClose={handleCloseRewardModal}
        centered
        withCloseButton={false}
        size="md"
        padding={0}
        className={classes.rewardModal}
      >
        <div className={classes.modalContent}>
          <div className={classes.confettiBackground} />

          <div className={classes.successIconWrapper}>
            <div className={classes.successIcon}>
              <BsCheckCircleFill size={60} />
            </div>
          </div>

          <Text
            size="2rem"
            fw={700}
            mt="xl"
            ta="center"
            className={classes.congratsText}
          >
            Congratulations! 🎉
          </Text>

          <div className={classes.rewardAmountCard}>
            <Text size="sm" c="dimmed" mb={8} ta="center">
              Reward Earned
            </Text>
            <Flex align="center" justify="center" gap="xs">
              <FaCoins size={32} color="#FFD700" />
              <Text size="3rem" fw={700} className={classes.amountText}>
                ₹{rewardData?.rewardAmount}
              </Text>
            </Flex>
          </div>

          <Text size="md" c="dimmed" ta="center" mb="xl">
            Successfully credited to your wallet! 💰
          </Text>

          <div className={classes.statsGrid}>
            <div className={classes.statCard}>
              <Text size="xs" c="dimmed" mb={4}>
                New Balance
              </Text>
              <Text size="xl" fw={700} c="blue">
                ₹{rewardData?.newBalance}
              </Text>
            </div>
            <div className={classes.statCard}>
              <Text size="xs" c="dimmed" mb={4}>
                Today's Tasks
              </Text>
              <Text size="xl" fw={700} c="violet">
                {rewardData?.todayTasksCompleted}
              </Text>
            </div>
            <div className={classes.statCard}>
              <Text size="xs" c="dimmed" mb={4}>
                Total Completed
              </Text>
              <Text size="xl" fw={700} c="green">
                {rewardData?.totalTasksCompleted}
              </Text>
            </div>
          </div>

          <Button
            size="xl"
            fullWidth
            onClick={handleCloseRewardModal}
            className={classes.continueButton}
            mt="xl"
          >
            Continue Earning
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VideoPlayerScreen;
