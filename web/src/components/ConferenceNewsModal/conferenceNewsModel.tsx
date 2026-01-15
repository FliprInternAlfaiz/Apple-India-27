import React from "react";
import {
  Modal,
  Box,
  Text,
  Image,
  Button,
  Flex,
  ActionIcon,
} from "@mantine/core";
import { IoClose } from "react-icons/io5";
import { FaExternalLinkAlt } from "react-icons/fa";
import classes from "./ConferenceNewsModal.module.scss";

interface ConferenceNewsModalProps {
  news: any;
  onClose: () => void;
}

const ConferenceNewsModal: React.FC<ConferenceNewsModalProps> = ({
  news,
  onClose,
}) => {
  const handleClick = () => {
    if (news?.clickUrl) window.open(news.clickUrl, "_blank");
  };

  return (
    <Modal
      opened
      onClose={onClose}
      size="md"
      centered
      withCloseButton={false}
      padding={0}
      radius="lg"
      classNames={{
        body: classes.modalBody,
        content: classes.modalContent,
      }}
      overlayProps={{ opacity: 0.7, blur: 3 }}
    >
      <Box className={classes.newsContainer}>
        <ActionIcon
          className={classes.closeButton}
          onClick={onClose}
          variant="filled"
          color="dark"
          size="lg"
          radius="xl"
        >
          <IoClose size={24} />
        </ActionIcon>

        <Box className={classes.imageContainer}>
          <Image
            src=// {`${import.meta.env.VITE_PUBLIC_BASE_URL || "http://localhost:5000"}$
            {
              news.imageUrl
              // }`
            }
            alt={news.title}
            fit="cover"
          />
        </Box>

        <Box className={classes.contentContainer}>
          <Text fw={700} size="xl" mb="md">
            {news.title}
          </Text>
          <Text size="md" c="dimmed" mb="xl">
            {news.description}
          </Text>

          <Flex gap="md" justify="center">
            {news.clickUrl && (
              <Button
                leftSection={<FaExternalLinkAlt />}
                onClick={handleClick}
                color="#2d1b4e"
                size="md"
                fullWidth
                radius="md"
              >
                Learn More
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="light"
              color="#2d1b4e"
              size="md"
              fullWidth
              radius="md"
            >
              Close
            </Button>
          </Flex>
        </Box>
      </Box>
    </Modal>
  );
};

export default React.memo(ConferenceNewsModal);
