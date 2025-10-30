import { Flex, Text, Card, Container, Box } from "@mantine/core";
import { FaCrown, FaMedal, FaRegUser, FaRegClock, FaRegCalendarAlt } from "react-icons/fa";
import classes from "./TeamManagement.module.scss";
import { IoTrophyOutline } from "react-icons/io5";


const TeamManagementScreen = () => {
   const teamLevels = [
    { level: "Level A", people: 8, icon: <FaCrown color="#d6d01eff"/>,}, 
    { level: "Level B", people: 2, icon: <FaMedal color="#C0C0C0"/>,  }, 
    { level: "Level C", people: 0, icon: <FaCrown color="#CD7F32"/>,  }, 
  ];

    const totalMembers = teamLevels.reduce((sum, lvl) => sum + lvl.people, 0);


  const managementOptions = [
    { icon: <FaRegUser />, label: "Regular staff" },
    { icon: <FaRegClock />, label: "Apprentice" },
    { icon: <FaRegCalendarAlt />, label: "Recruitment" },
    { icon: <IoTrophyOutline />, label: "Competition" },
  ];

  return (
    <Flex className={classes.teamContainer} direction="column">
      {/* Team Info */}
      <Container className={classes.teamInfoSection}>
        <Card className={classes.totalTeamCard} radius="lg">
          <Text size="md" fw={500} mb="xs" className={classes.managementTitle}>
            Total Number of team members
          </Text>
          <Text size="24px" fw={600} mb="md" className={classes.managementTitle}>
            {totalMembers}
          </Text>

            <Text size="sm" c="dimmed" mb="lg" className={classes.managementTitle}>
            {teamLevels.map((lvl, idx) => (
              <span key={idx}>
                {lvl.level}: {lvl.people} People {" "}
              </span>
            ))}
          </Text>

              <Flex gap="md" wrap="wrap" justify="center" mb="lg">
            {teamLevels.map((lvl, idx) => (
              <Flex
                key={idx}
                direction="column"
                align="center"
                className={`${classes.levelCard} ${classes["level" + lvl.level.split(" ")[1]]}`}
                onClick={() => {}}
              >
                <Box className={classes.levelIcon}>{lvl.icon}</Box>
                <Text size="sm" fw={600} mt="xs">
                  {lvl.level}
                </Text>
                <Text size="xs" c="dimmed">
                  {lvl.people} People
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Container>


<Box className={classes.managementSection}>
  <Text size="lg" fw={600} mb="lg" className={classes.managementTitle}>
    Manage my direct recruiting team
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

    </Flex>
  );
};

export default TeamManagementScreen;
