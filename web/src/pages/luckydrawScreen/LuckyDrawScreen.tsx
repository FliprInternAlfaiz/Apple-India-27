    import React, { useState, useMemo } from "react";
import {
  Title,
  Text,
  Card,
  Center,
  Loader,
  Image,
  Box,
  Flex,
  ActionIcon,
  Badge,
  Button,
  Group,
} from "@mantine/core";
import { IoRefresh, IoArrowBack, IoTrophy, IoCalendar, IoPeople } from "react-icons/io5";
import { notifications } from "@mantine/notifications";
import classes from "./LuckyDrawScreen.module.scss";
import {
  useActiveLuckyDrawsQuery,
  useParticipateInLuckyDraw,
} from "../../hooks/query/luckydraw.query";
import LuckyDrawModal from "../../components/LuckyDrawModal/LuckyDrawModal";
import { useNavigate } from "react-router-dom";

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
  prizes?: Array<{ name: string; description: string; value?: string }>;
  status: string;
}

const LuckyDrawScreen: React.FC = () => {
  const [selectedDraw, setSelectedDraw] = useState<LuckyDraw | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useActiveLuckyDrawsQuery();
  const { mutate: participate, isPending: isParticipating } = useParticipateInLuckyDraw();

const luckyDrawsList = useMemo<LuckyDraw[]>(() => {
  return data?.data || [];
}, [data]);
  const handleParticipate = (drawId: string) => {
    participate(drawId, {
      onSuccess: (response) => {
        notifications.show({
          title: "Success!",
          message: response.message || "You've successfully participated in the lucky draw!",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Error",
          message: error.response?.data?.message || "Failed to participate. Please try again.",
          color: "red",
        });
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Center h="80vh">
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Flex justify="space-between" align="center" className={classes.header}>
        <Flex align="center" gap="md">
          <ActionIcon
            variant="light"
            color="white"
            size="lg"
            radius="xl"
            onClick={() => navigate(-1)}
          >
            <IoArrowBack size={22} />
          </ActionIcon>
          <Title order={2} className={classes.headerTitle}>
            🎁 Lucky Draws & Offers
          </Title>
        </Flex>

        <ActionIcon
          variant="light"
          color="white"
          size="lg"
          radius="xl"
          title="Refresh"
          onClick={() => refetch()}
        >
          <IoRefresh size={22} />
        </ActionIcon>
      </Flex>

      {luckyDrawsList.length === 0 ? (
        <Center h="60vh" px="10">
          <Box ta="center">
            <IoTrophy size={64} color="white" />
            <Text c="white" mt="md" size="lg">
              No active lucky draws at the moment.
            </Text>
            <Text c="white" size="sm" mt="xs">
              Check back soon for exciting offers!
            </Text>
          </Box>
        </Center>
      ) : (
        <div className={classes.grid}>
          {luckyDrawsList.map((draw:LuckyDraw) => (
            <Card
              key={draw._id}
              shadow="md"
              radius="lg"
              className={classes.card}
              onClick={() => setSelectedDraw(draw)}
            >
              <Card.Section className={classes.imageSection}>
                <Image
                  src={draw.imageUrl}
                  height={200}
                  alt={draw.title}
                  className={classes.image}
                />
                <Badge
                  className={classes.badge}
                  color="red"
                  variant="filled"
                  size="lg"
                >
                  <IoTrophy size={16} /> LIVE
                </Badge>
              </Card.Section>

              <Box mt="md">
                <Title order={4} lineClamp={1}>
                  {draw.title}
                </Title>
                <Text c="dimmed" size="sm" mt="xs" lineClamp={2}>
                  {draw.description}
                </Text>

                {/* Stats */}
                <Group mt="md" gap="xs">
                  <Badge leftSection={<IoPeople size={12} />} variant="light" color="blue">
                    {draw.participantCount}
                    {draw.maxParticipants ? `/${draw.maxParticipants}` : ""} joined
                  </Badge>
                  {draw.winnerSelectionDate && (
                    <Badge leftSection={<IoCalendar size={12} />} variant="light" color="grape">
                      {formatDate(draw.winnerSelectionDate)}
                    </Badge>
                  )}
                </Group>

                {/* Participate Button */}
                <Button
                  fullWidth
                  mt="md"
                  color="green"
                  variant="light"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleParticipate(draw._id);
                  }}
                  loading={isParticipating}
                >
                  🎲 Participate Now
                </Button>
              </Box>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedDraw && (
        <LuckyDrawModal
          draw={selectedDraw}
          onClose={() => setSelectedDraw(null)}
          onParticipate={handleParticipate}
          isParticipating={isParticipating}
        />
      )}
    </div>
  );
};

export default LuckyDrawScreen;