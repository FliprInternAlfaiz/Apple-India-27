import React, { useState, type JSX } from "react";
import {
  Flex,
  Text,
  Card,
  Container,
  Box,
  Button,
  Modal,
  Badge,
  Center,
} from "@mantine/core";
import {
  FaCrown,
  FaMedal,
  FaRegUser,
  FaRegClock,
  FaShare,
  FaCopy,
  FaRegCalendarAlt,
} from "react-icons/fa";
import { IoTrophyOutline } from "react-icons/io5";
import { notifications } from "@mantine/notifications";
import classes from "./TeamManagement.module.scss";
import {
  useTeamStatsQuery,
  useReferralLinkQuery,
  useTeamMembersByLevelQuery,
} from "../../hooks/query/team.query";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface TeamLevel {
  level: string;
  count: number;
  icon: JSX.Element;
  color: string;
  members: any[];
}

const TeamManagementScreen: React.FC = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const {
    data: teamStatsData,
    isLoading: teamLoading,
    isError: teamError,
  } = useTeamStatsQuery();
  const {
    data: referralData,
    isLoading: referralLoading,
    isError: referralError,
  } = useReferralLinkQuery();
  const { data: teamMembersData, isFetching: membersLoading } =
    useTeamMembersByLevelQuery(selectedLevel || "", enabled);

  const teamData = teamStatsData || { totalMembers: 0, teamLevels: [] };

  const { userData } = useSelector((state: RootState) => state.auth);

  const defaultLevels = [
    { level: "A", count: 0, members: [] },
    { level: "B", count: 0, members: [] },
    { level: "C", count: 0, members: [] },
  ];

  const apiLevels = teamData.teamLevels || [];
  const mergedLevels = defaultLevels.map((defaultLevel) => {
    const apiLevel = apiLevels.find((l: any) => l.level === defaultLevel.level);
    return apiLevel || defaultLevel;
  });

  const formattedLevels: TeamLevel[] = mergedLevels.map((level: any) => ({
    level: level.level,
    count: level.count,
    icon:
      level.level === "A" ? (
        <FaCrown color="#E5E4E2" size={38} />
      ) : level.level === "B" ? (
        <FaMedal color="rgb(212, 160, 23)" size={38} />
      ) : (
        <FaMedal color="#C0C0C0" size={38} />
      ),
    color:
      level.level === "A"
        ? "#E5E4E2"
        : level.level === "B"
        ? "rgb(212, 160, 23)"
        : "#C0C0C0",
    members: level.members || [],
  }));

  const handleLevelClick = (level: string) => {
    setSelectedLevel(level);
    setEnabled(true);
    setModalOpened(true);
  };

  const handleCopy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notifications.show({ title: "Copied", message, color: "teal" });
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to copy",
        color: "red",
      });
    }
  };

  const handleShare = async () => {
    if (!referralData?.data) {
      notifications.show({
        title: "Error",
        message: "Referral data not available",
        color: "red",
      });
      return;
    }

    const { shareMessage, referralLink } = referralData.data;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join our platform",
          text: shareMessage,
          url: referralLink,
        });
        notifications.show({
          title: "Shared",
          message: "Referral link shared successfully!",
          color: "teal",
        });
      } catch {
        handleCopy(shareMessage, "Referral message copied!");
      }
    } else {
      handleCopy(shareMessage, "Referral message copied!");
    }
  };

  if (teamLoading || referralLoading) {
    return (
      <Center>
        <Text c="black" size="lg">
          Loading team data...
        </Text>
      </Center>
    );
  }

  if (teamError || referralError) {
    return (
      <Flex
        justify="center"
        align="center"
        direction="column"
        className={classes.fullScreen}
      >
        <Text c="red" size="lg">
          Failed to load team data
        </Text>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </Flex>
    );
  }

  const managementOptions = [
    { icon: <FaRegUser />, label: "Regular staff" },
    { icon: <FaRegClock />, label: "Apprentice" },
    { icon: <FaRegCalendarAlt />, label: "Recruitment" },
    { icon: <IoTrophyOutline />, label: "Competition" },
  ];

  return (
    <Flex className={classes.teamContainer} direction="column">
      <Container className={classes.teamInfoSection}>
        <Card className={classes.totalTeamCard} radius="lg">
          <Text fw={600} size="xl" ta="center" mb="sm">
            Total Team Members
          </Text>
          <Text fw={700} size="36px" ta="center" mb="md">
            {teamData.totalMembers}
          </Text>

          {userData?.teamLevel && (
            <Flex justify="center" align="center" mb="md" gap="xs">
              <FaMedal
                color={
                  userData?.teamLevel === "A"
                    ? "#E5E4E2" // Platinum
                    : userData?.teamLevel === "B"
                    ? "rgb(212, 160, 23)" // Gold
                    : "#C0C0C0" // Silver
                }
                size={20}
              />
              <Text
                fw={600}
                c={
                  userData?.teamLevel === "A"
                    ? "#E5E4E2"
                    : userData?.teamLevel === "B"
                    ? "rgb(212, 160, 23)"
                    : "#C0C0C0"
                }
              >
                Your Level: {userData?.teamLevel}
              </Text>
            </Flex>
          )}

          <Flex gap="lg" wrap="wrap" justify="center">
            {formattedLevels.map((lvl, idx) => (
              <Card
                key={idx}
                className={`${classes.levelCard} ${
                  classes["level" + lvl.level]
                }`}
                onClick={() => handleLevelClick(lvl.level)}
                shadow="lg"
              >
                <Box className={classes.levelIcon}>{lvl.icon}</Box>
                <Text fw={600} size="md">
                  {lvl.level === "A"
                    ? "Level A"
                    : lvl.level === "B"
                    ? "Level B"
                    : "Level C"}
                </Text>
                <Text size="sm" c="dimmed">
                  {lvl.count} {lvl.count === 1 ? "Member" : "Members"}
                </Text>
              </Card>
            ))}
          </Flex>
        </Card>
      </Container>

      <Card className={classes.referralCard} radius="lg" shadow="md">
        <Text fw={600} size="lg" ta="center" mb="md">
          Your Referral Link
        </Text>
        <Text ta="center" c="dimmed" mb="md" className={classes.referralLink}>
          {referralData?.data?.referralLink || "Loading..."}
        </Text>
        <Flex gap="sm" justify="center" wrap="wrap">
          <Button
            leftSection={<FaShare />}
            onClick={handleShare}
            color="blue"
            size="md"
          >
            Share
          </Button>
          <Button
            leftSection={<FaCopy />}
            variant="outline"
            color="blue"
            size="md"
            onClick={() =>
              handleCopy(
                referralData?.data?.referralLink || "",
                "Referral link copied!"
              )
            }
          >
            Copy Link
          </Button>
        </Flex>
      </Card>

      <Box className={classes.managementSection}>
        <Text size="lg" fw={600} mb="lg" className={classes.managementTitle}>
          Manage My Direct Recruiting Team
        </Text>
        <Flex gap="lg" px="lg" wrap="wrap" justify="center">
          {managementOptions.map((option, idx) => (
            <Flex
              key={idx}
              direction="column"
              align="center"
              gap="sm"
              className={classes.managementItem}
              onClick={() => console.log(option.label)}
            >
              <Box className={classes.managementIcon}>{option.icon}</Box>
              <Text size="sm" fw={500} ta="center">
                {option.label}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEnabled(false);
        }}
        title={
          <Text size="lg" fw={600}>
            Level {selectedLevel} Members
          </Text>
        }
        size="lg"
        centered
      >
        {membersLoading ? (
          <Flex justify="center" py="xl">
            <Text>Loading members...</Text>
          </Flex>
        ) : !teamMembersData?.data?.members ||
          teamMembersData.data.members.length === 0 ? (
          <Flex
            justify="center"
            direction="column"
            align="center"
            py="xl"
            gap="md"
          >
            <FaRegUser size={48} color="#ccc" />
            <Text ta="center" c="dimmed">
              No members yet in this level
            </Text>
            <Text size="sm" ta="center" c="dimmed">
              Share your referral link to start building your team!
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="md">
            {teamMembersData.data.members.map((member: any) => (
              <Card
                key={member.id}
                padding="md"
                radius="md"
                withBorder
                shadow="sm"
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fw={600}>{member.name}</Text>
                    <Text size="sm" c="dimmed">
                      {member.phone}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Joined:{" "}
                      {new Date(member.joinedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Box>
                  <Box style={{ textAlign: "right" }}>
                    <Badge
                      color={
                        member.currentLevel === "A"
                          ? "yellow"
                          : member.currentLevel === "B"
                          ? "gray"
                          : "orange"
                      }
                    >
                      Level {member.currentLevel}
                    </Badge>
                    {member.investmentAmount > 0 && (
                      <Text size="xs" c="dimmed" mt="xs">
                        ₹{member.investmentAmount}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Modal>
    </Flex>
  );
};

export default TeamManagementScreen;
