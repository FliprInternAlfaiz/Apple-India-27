import React, { useEffect, useState } from "react";
import { Modal, Image, Text, Button, Group, Box, ActionIcon } from "@mantine/core";
import { IoClose, IoOpenOutline } from "react-icons/io5";
import { useActiveConferenceNewsQuery, useCloseConferenceNews } from "../../hooks/query/conferenceNews.query";

const ConferenceNewsModal: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  
  const { data, isLoading } = useActiveConferenceNewsQuery();
  const closeNewsMutation = useCloseConferenceNews();
  
  const news = data?.data;

  useEffect(() => {
    // Show modal only once per session when news is available
    if (news && !hasShownOnce) {
      const timer = setTimeout(() => {
        setOpened(true);
        setHasShownOnce(true);
      }, 1500); // Show after 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [news, hasShownOnce]);

  const handleClose = async () => {
    if (news) {
      try {
        await closeNewsMutation.mutateAsync(news._id);
      } catch (error) {
        console.error("Failed to track close:", error);
      }
    }
    setOpened(false);
  };

  const handleClickUrl = () => {
    if (news?.clickUrl) {
      window.open(news.clickUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading || !news) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      padding={0}
      centered
      withCloseButton={false}
      overlayProps={{
        opacity: 0.7,
        blur: 4,
      }}
      styles={{
        body: { padding: 0 },
        content: {
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Box style={{ position: "relative" }}>
        {/* Close Button */}
        <ActionIcon
          variant="filled"
          color="dark"
          size="lg"
          radius="xl"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
          }}
          onClick={handleClose}
        >
          <IoClose size={20} color="white" />
        </ActionIcon>

        {/* Image Section */}
        <Box style={{ position: "relative", backgroundColor: "#000" }}>
          <Image
            src={news.imageUrl}
            alt={news.title}
            height={400}
            fit="contain"
            style={{
              width: "100%",
            }}
          />
          
          {/* Gradient Overlay at Bottom */}
          <Box
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
            }}
          />
        </Box>

        {/* Content Section */}
        <Box
          p="xl"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <Text
            size="xl"
            fw={700}
            mb="sm"
            style={{ color: "white", lineHeight: 1.3 }}
          >
            {news.title}
          </Text>
          
          <Text
            size="sm"
            mb="xl"
            style={{ 
              color: "rgba(255, 255, 255, 0.9)",
              lineHeight: 1.6,
            }}
          >
            {news.description}
          </Text>

          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Text size="xs" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                👁️ {news.viewCount} views
              </Text>
              {news.closeCount > 0 && (
                <>
                  <Text size="xs" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    •
                  </Text>
                  <Text size="xs" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    ❌ {news.closeCount} closed
                  </Text>
                </>
              )}
            </Group>

            {news.clickUrl && (
              <Button
                variant="white"
                size="md"
                radius="xl"
                rightSection={<IoOpenOutline size={18} />}
                onClick={handleClickUrl}
                styles={{
                  root: {
                    fontWeight: 600,
                    paddingLeft: 24,
                    paddingRight: 24,
                  },
                }}
              >
                Learn More
              </Button>
            )}
          </Group>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConferenceNewsModal;