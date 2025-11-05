import React from "react";
import {
  Modal,
  Image,
  Title,
  Text,
  Button,
  Stack,
  Badge,
  Group,
  Divider,
  Box,
  List,
  ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import {
  IoTrophy,
  IoCalendar,
  IoPeople,
  IoCheckmarkCircle,
  IoClose,
} from "react-icons/io5";
import classes from "./LuckyDrawModal.module.scss";

interface Prize {
  name: string;
  description: string;
  value?: string;
}

interface LuckyDraw {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  offerDetails: string;
  termsConditions?: string[];
  expiryDate?: string;
  winnerSelectionDate?: string;
  maxParticipants?: number;
  participantCount: number;
  prizes?: Prize[];
  status: string;
}

interface LuckyDrawModalProps {
  draw: LuckyDraw;
  onClose: () => void;
  onParticipate: (drawId: string) => void;
  isParticipating: boolean;
}

const LuckyDrawModal: React.FC<LuckyDrawModalProps> = ({
  draw,
  onClose,
  onParticipate,
  isParticipating,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isSpotsFull =
    draw.maxParticipants && draw.participantCount >= draw.maxParticipants;

  return (
    <Modal
      opened={true}
      onClose={onClose}
      size="md"
      centered
      withCloseButton={false}
      classNames={{ body: classes.modalBody }}
    >
      {/* Top Image Section */}
      <Box className={classes.imageWrapper}>
        <Image
          src={draw.imageUrl}
          height={280}
          alt={draw.title}
          radius="md"
          className={classes.modalImage}
        />

        {/* Close Icon positioned inside top-right corner */}
        <ActionIcon
          variant="light"
          radius="xl"
          size="lg"
          className={classes.closeIcon}
          onClick={onClose}
        >
          <IoClose size={20} />
        </ActionIcon>
      </Box>

      <Stack gap="lg" mt="md">
        {/* Title + Status */}
        <Box>
          <Group justify="space-between" align="start">
            <Title order={2}>{draw.title}</Title>
            <Badge
              size="lg"
              variant="filled"
              color={draw.status === "ongoing" ? "green" : "blue"}
              leftSection={<IoTrophy size={16} />}
            >
              {draw.status.toUpperCase()}
            </Badge>
          </Group>
          <Text c="dimmed" size="sm" mt="xs">
            {draw.description}
          </Text>
        </Box>

        <Divider />

        {/* Stats Section */}
        <Group grow>
          <Box className={classes.statBox}>
            <IoPeople size={24} color="#228be6" />
            <Text size="xl" fw={700} mt="xs">
              {draw.participantCount}
              {draw.maxParticipants ? `/${draw.maxParticipants}` : ""}
            </Text>
            <Text size="sm" c="dimmed">
              Participants
            </Text>
          </Box>

          {draw.winnerSelectionDate && (
            <Box className={classes.statBox}>
              <IoCalendar size={24} color="#be4bdb" />
              <Text size="sm" fw={500} mt="xs">
                {formatDate(draw.winnerSelectionDate)}
              </Text>
              <Text size="sm" c="dimmed">
                Winner Announcement
              </Text>
            </Box>
          )}
        </Group>

        <Divider />

        {/* Offer Details */}
        <Box>
          <Title order={4} mb="sm">
            🎁 Offer Details
          </Title>
          <Text>{draw.offerDetails}</Text>
        </Box>

        {/* Prizes */}
        {draw.prizes?.length ? (
          <Box>
            <Title order={4} mb="sm">
              🏆 Prizes
            </Title>
            <Stack gap="xs">
              {draw.prizes.map((prize, index) => (
                <Box key={index} className={classes.prizeBox}>
                  <Text fw={600}>{prize.name}</Text>
                  <Text size="sm" c="dimmed">
                    {prize.description}
                  </Text>
                  {prize.value && (
                    <Badge mt="xs" variant="light" color="orange">
                      Worth: {prize.value}
                    </Badge>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        {/* Terms */}
        {draw.termsConditions?.length ? (
          <Box>
            <Title order={4} mb="sm">
              📋 Terms & Conditions
            </Title>
            <List
              spacing="xs"
              size="sm"
              icon={
                <ThemeIcon color="blue" size={20} radius="xl">
                  <IoCheckmarkCircle size={14} />
                </ThemeIcon>
              }
            >
              {draw.termsConditions.map((term, index) => (
                <List.Item key={index}>{term}</List.Item>
              ))}
            </List>
          </Box>
        ) : null}

        <Divider />

        {/* Action Buttons */}
        <Group grow>
          <Button
            variant="light"
            color="gray"
            leftSection={<IoClose size={18} />}
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            color="green"
            leftSection={<IoTrophy size={18} />}
            onClick={() => onParticipate(draw._id)}
            loading={isParticipating}
            disabled={isSpotsFull || draw.status !== "ongoing"}
          >
            {isSpotsFull
              ? "Spots Full"
              : draw.status !== "ongoing"
              ? "Draw Closed"
              : "Participate Now"}
          </Button>
        </Group>

        {/* Expiry Info */}
        {draw.expiryDate && (
          <Text size="xs" c="dimmed" ta="center">
            Offer expires on {formatDate(draw.expiryDate)}
          </Text>
        )}
      </Stack>
    </Modal>
  );
};

export default LuckyDrawModal;
