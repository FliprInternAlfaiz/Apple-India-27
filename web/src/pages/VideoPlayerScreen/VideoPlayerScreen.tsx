import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Flex, Text, Loader, Button, Modal, Progress } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  useTaskQuery,
  useCompleteTaskMutation,
  type TCompleteTaskResponse,
} from "../../hooks/query/useGetTask.query";
import classes from "./VideoPlayerScreen.module.scss";
import { FiX, FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { FaCoins, FaPlay } from "react-icons/fa";
import { BsCheckCircleFill } from "react-icons/bs";
import CommonHeader from "../../components/CommonHeader/CommonHeader";

const VideoPlayerScreen: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State management
  const [videoWatched, setVideoWatched] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
  const [hasStartedWatching, setHasStartedWatching] = useState(false);
  const [rewardData, setRewardData] = useState<TCompleteTaskResponse | null>(null);
  
  // Refs to track state
  const watchedSegmentsRef = useRef<Set<number>>(new Set());
  const hasAutoRewardedRef = useRef(false);
  const lastTimeRef = useRef(0);

  const { data, isLoading, isError, error } = useTaskQuery(taskId!);
  const completeMutation = useCompleteTaskMutation();
  const task = data?.task;

  const handleAutoReward = useCallback(async () => {
  if (!taskId || videoWatched || isProcessingReward || hasAutoRewardedRef.current) {
    return;
  }

  hasAutoRewardedRef.current = true;
  setIsProcessingReward(true);

  try {
    const result = await completeMutation.mutateAsync(taskId);

    // The API returns only data (no .status), so just treat any successful response as success
    if (result && typeof result.rewardAmount !== "undefined") {
      // ✅ Reward successfully granted or already claimed
      setRewardData(result);
      setVideoWatched(true);
      setWatchProgress(100);

      // Slight delay before modal for smooth UX
      setTimeout(() => {
        setShowRewardModal(true);
      }, 100);

      notifications.show({
        title: "🎉 Congratulations!",
        message: `You've earned Rs ${result.rewardAmount}`,
        color: "green",
        icon: <BsCheckCircleFill size={18} />,
        autoClose: 4000,
      });
    } else {
      throw new Error("Unexpected reward response");
    }
  } catch (err: any) {
    console.error("❌ Error claiming reward:", err);

    // Handle already completed gracefully
    const alreadyCompleted =
      err?.response?.status === 400 &&
      err?.response?.data?.message?.toLowerCase()?.includes("already completed");

    if (alreadyCompleted) {
      setVideoWatched(true);
      setShowRewardModal(true);

      notifications.show({
        title: "✅ Task Already Completed",
        message: "You've already earned this reward earlier.",
        color: "blue",
        icon: <BsCheckCircleFill size={18} />,
        autoClose: 4000,
      });
    } else {
      // Other errors
      setVideoWatched(false);
      setIsProcessingReward(false);
      hasAutoRewardedRef.current = false;

      notifications.show({
        title: "Error",
        message: err?.message || "Failed to process reward",
        color: "red",
        icon: <FiX size={18} />,
      });
    }
  } finally {
    setIsProcessingReward(false);
  }
}, [taskId, videoWatched, isProcessingReward, completeMutation]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleLoadedMetadata = () => {
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const duration = video.duration;

      if (!duration || isNaN(duration)) {
        return;
      }

      // Track watched segments (5-second chunks)
      const segmentIndex = Math.floor(currentTime / 5);
      watchedSegmentsRef.current.add(segmentIndex);

      // Calculate progress based on watched segments
      const totalSegments = Math.ceil(duration / 5);
      const watchedCount = watchedSegmentsRef.current.size;
      const watchedPercentage = (watchedCount / totalSegments) * 100;

      setWatchProgress(Math.min(watchedPercentage, 100));
      lastTimeRef.current = currentTime;

      // Trigger reward at 5% progress
      if (watchedPercentage >= 5 && !hasAutoRewardedRef.current && !isProcessingReward) {
        handleAutoReward();
      }
    };

    const handleEnded = () => {
      if (!hasAutoRewardedRef.current && !isProcessingReward) {
        handleAutoReward();
      }
    };

    const handleSeeking = () => {
      if (video.currentTime > lastTimeRef.current + 1.5) {
        video.currentTime = lastTimeRef.current;
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
      lastTimeRef.current = video.currentTime;
    };

    const handlePause = () => {
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

    // Add event listeners
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
  }, [handleAutoReward, isProcessingReward]);

  // Handle tab visibility
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

  // Loading state
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

  // Error state
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

  // Already completed state
  if (task.isCompleted && !showRewardModal && !videoWatched) {
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

  const progressPercentage = Math.round(watchProgress);

  return (
    <div className={classes.videoPlayerContainer}>
      {/* Header */}
      <CommonHeader heading={task.level}/>

      {/* Video Section */}
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

        {/* Progress Overlay */}
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
                  Reward processed successfully!
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

      {/* Instructions Card */}
      {!hasStartedWatching && (
        <div className={classes.instructionsCard}>
          <Text size="lg" fw={700} mb="md" ta="center">
            📺 How to Earn Your Reward
          </Text>
          <Flex direction="column" gap="sm">
            <Flex align="center" gap="md">
              <div className={classes.stepNumber}>1</div>
              <Text size="sm">Watch at least 5% of the video</Text>
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

      {/* Reward Modal */}
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
              <BsCheckCircleFill size={40} />

               <Text
            size="30px"
            fw={700}
            ta="center"
            className={classes.congratsText}
          >
            Congratulations! 🎉
          </Text>
            </div>

         

          <div className={classes.rewardAmountCard}>
            <Text size="sm" c="dimmed" mb={8} ta="center">
              Reward Earned
            </Text>
            <Flex align="center" justify="center" gap="xs">
              <FaCoins size={32} color="#FFD700" />
              <Text size="3rem" fw={700} className={classes.amountText}>
                ₹{rewardData?.rewardAmount || task.rewardPrice}
              </Text>
            </Flex>
          </div>

          <Text size="md" c="dimmed" ta="center" my="20">
            Successfully credited to your wallet! 💰
          </Text>

          <div className={classes.statsGrid}>
            <div className={classes.statCard}>
              <Text size="xs" c="dimmed" mb={4}>
                Today's Tasks
              </Text>
              <Text size="xl" fw={700} c="violet">
                {rewardData?.todayTasksCompleted || 0}
              </Text>
            </div>
            <div className={classes.statCard}>
              <Text size="xs" c="dimmed" mb={4}>
                Total Completed
              </Text>
              <Text size="xl" fw={700} c="green">
                {rewardData?.totalTasksCompleted || 0}
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