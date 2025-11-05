import React, { useState, useMemo } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Center,
  Loader,
  Image,
  Pagination,
  Box,
  Flex,
  ActionIcon,
} from "@mantine/core";
import { IoRefresh, IoArrowBack } from "react-icons/io5";
import classes from "./ConferenceNewsScreen.module.scss";
import { useAllConferenceNewsQuery } from "../../hooks/query/conferenceNews.query";
import ConferenceNewsModal from "../../components/ConferenceNewsModal/conferenceNewsModel";
import { useNavigate } from "react-router-dom";

interface ConferenceNews {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
  clickUrl?: string;
}

interface ConferenceNewsResponse {
  conferenceNews: ConferenceNews[];
  pagination?: {
    totalPages: number;
    page: number;
  };
}

const ConferenceNewsScreen: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [selectedNews, setSelectedNews] = useState<ConferenceNews | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useAllConferenceNewsQuery(
    page,
    limit
  ) as {
    data?: ConferenceNewsResponse;
    isLoading: boolean;
    refetch: () => void;
  };

  const newsList = useMemo(() => data?.conferenceNews || [], [data]);
  const totalPages = useMemo(() => data?.pagination?.totalPages || 1, [data]);

  if (isLoading) {
    return (
      <Center h="80vh">
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  return (
    <Container size="lg" className={classes.wrapper}>
      {/* Header Section */}
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
            Conference News
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

      {/* News Grid */}
      {newsList.length === 0 ? (
        <Center h="60vh">
          <Text c="dimmed">No conference news available.</Text>
        </Center>
      ) : (
        <div className={classes.grid}>
          {newsList.map((news) => (
            <Card
              key={news._id}
              shadow="md"
              radius="lg"
              className={classes.card}
              onClick={() => setSelectedNews(news)}
            >
              <Card.Section>
                <Image
                  src={news.imageUrl}
                  height={180}
                  alt={news.title}
                  className={classes.image}
                />
              </Card.Section>

              <Box mt="md">
                <Text fw={600} size="lg" lineClamp={1}>
                  {news.title}
                </Text>
                <Text c="dimmed" size="sm" mt="xs" lineClamp={2}>
                  {news.description}
                </Text>
              </Box>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            color="blue"
          />
        </Center>
      )}

      {/* Modal */}
      {selectedNews && (
        <ConferenceNewsModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </Container>
  );
};

export default ConferenceNewsScreen;
