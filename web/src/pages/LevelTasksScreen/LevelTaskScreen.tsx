import { useState } from "react";
import { Flex, Text, Card, Container, Box } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { FaStar } from "react-icons/fa";
import classes from "./LevelTasksScreen.module.scss";

const LevelTasksScreen = () => {
  const [activeLevel, setActiveLevel] = useState(0);

  const levelData = [
    {
      level: "Apple1",
      remaining: 5,
      completed: 15,
      target: 4500,
      dailyTasks: "6-12",
      commission: "120-240",
      invitations: [
        { method: "Invite A-level to join", rate: "8%", amount: "450" },
        { method: "Invite B-level to join", rate: "3%", amount: "180" },
        { method: "Invite C-level to join", rate: "1%", amount: "45" },
      ],
    },
    {
      level: "Apple2",
      remaining: 0,
      completed: 20,
      target: 5970,
      dailyTasks: "8-16",
      commission: "144-288",
      invitations: [
        { method: "Invite A-level to join", rate: "10%", amount: "597" },
        { method: "Invite B-level to join", rate: "4%", amount: "238.8" },
        { method: "Invite C-level to join", rate: "1%", amount: "59.7" },
      ],
    },
    {
      level: "Apple3",
      remaining: 2,
      completed: 18,
      target: 7200,
      dailyTasks: "10-20",
      commission: "180-360",
      invitations: [
        { method: "Invite A-level to join", rate: "12%", amount: "720" },
        { method: "Invite B-level to join", rate: "5%", amount: "300" },
        { method: "Invite C-level to join", rate: "2%", amount: "120" },
      ],
    },
    {
      level: "Apple4",
      remaining: 3,
      completed: 17,
      target: 5500,
      dailyTasks: "12-24",
      commission: "220-440",
      invitations: [
        { method: "Invite A-level to join", rate: "15%", amount: "950" },
        { method: "Invite B-level to join", rate: "6%", amount: "380" },
        { method: "Invite C-level to join", rate: "3%", amount: "190" },
      ],
    },
    {
      level: "Apple5",
      remaining: 3,
      completed: 17,
      target: 500,
      dailyTasks: "12-24",
      commission: "220-440",
      invitations: [
        { method: "Invite A-level to join", rate: "15%", amount: "950" },
        { method: "Invite B-level to join", rate: "6%", amount: "380" },
        { method: "Invite C-level to join", rate: "3%", amount: "190" },
      ],
    },
    {
      level: "Apple6",
      remaining: 3,
      completed: 17,
      target: 9500000,
      dailyTasks: "12-24",
      commission: "220-440",
      invitations: [
        { method: "Invite A-level to join", rate: "15%", amount: "950" },
        { method: "Invite B-level to join", rate: "6%", amount: "380" },
        { method: "Invite C-level to join", rate: "3%", amount: "190" },
      ],
    },
    {
      level: "Apple7",
      remaining: 3,
      completed: 17,
      target: 9500,
      dailyTasks: "12-24",
      commission: "220-440",
      invitations: [
        { method: "Invite A-level to join", rate: "15%", amount: "950" },
        { method: "Invite B-level to join", rate: "6%", amount: "380" },
        { method: "Invite C-level to join", rate: "3%", amount: "190" },
      ],
    },
  ];

  const currentData = levelData[activeLevel];

  return (
    <div className={classes.screen}>
      {/* Level Cards Carousel */}
      <Container className={classes.carouselContainer}>
        <Carousel
          withControls
          slideSize="100%"
          slideGap="md"
          emblaOptions={{ loop: true, align: "start" }}
          onSlideChange={setActiveLevel}
        >
          {levelData.map((data, idx) => {
            const slideProgress =
              data.completed > 0
                ? (data.completed / (data.completed + data.remaining)) * 100
                : 0;

            return (
              <Carousel.Slide key={idx}>
                <Card className={classes.levelCard}>
                  <Flex align="center" gap="xs" mb="md">
                    <span>🏅</span>
                    <Text size="lg" fw={500}>
                      {data.level}
                    </Text>
                  </Flex>

                  <Flex justify="space-between" align="flex-end">
                    <Flex direction="column">
                      <Text size="md" fw={500} mb="xs">
                        Remaining tasks: {data.remaining}
                      </Text>
                      <Text size="md" fw={500} mb="md">
                        Completed tasks: {data.completed}
                      </Text>
                    </Flex>
                    <Box className={classes.targetBox}>
                      <Text size="md" fw={500}>
                        Target amount
                      </Text>
                      <Text size="md" fw={700}>
                        {data.target}
                      </Text>
                    </Box>
                  </Flex>

                  <Box className={classes.progressBar}>
                    <Box
                      className={classes.progressFill}
                      style={{ width: `${slideProgress}%` }}
                    />
                  </Box>
                </Card>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Container>

      {/* Level Indicators */}
      <Box mt="xl">
        <Carousel
          withControls={false}
          slideSize={{ base: "20%", sm: "15%" }}
          height={80}
          emblaOptions={{ loop: true, align: "center" }}
          slideGap="sm"
          draggable
        >
          {levelData.map((data, index) => (
            <Carousel.Slide key={index}>
              <Box
                onClick={() => setActiveLevel(index)}
                className={`${classes.levelIndicator} ${
                  activeLevel === index ? classes.activeIndicator : ""
                }`}
              >
                {activeLevel === index ? <FaStar size={16} /> : <span className={classes.inactiveDot} />}
                <Text fz="xs">{data.level}</Text>
              </Box>
            </Carousel.Slide>
          ))}
        </Carousel>
      </Box>

      {/* Details Section */}
      <Box className={classes.detailsSection}>
        <Flex className={classes.levelTitleWrapper}>
          <Text size="md" fw={700}>
            {currentData.level}
          </Text>
        </Flex>

        <Text size="sm" fw={500} className={classes.sectionSubtitle}>
          Number of promotion tasks and commission income per day
        </Text>

        <div className={classes.tableContainer}>
          <Flex justify="space-between" className={classes.tableHeader}>
            <Text size="sm" fw={700} className={classes.flex2}>
              Time unit
            </Text>
            <Text size="sm" fw={700} className={classes.flex1Center}>
              Number of tasks
            </Text>
            <Text size="sm" fw={700} className={classes.flex1Right}>
              Total commission
            </Text>
          </Flex>

          <Flex justify="space-between" className={`${classes.tableRow} ${classes.tableRowBorder}`}>
            <Text size="xs" fw={600} className={classes.flex2}>
              Daily
            </Text>
            <Text size="xs" fw={600} className={classes.flex1Center}>
              {currentData.dailyTasks}
            </Text>
            <Text size="xs" fw={600} className={classes.flex1Right}>
              {currentData.commission}
            </Text>
          </Flex>
        </div>

        <Text size="sm" fw={500} className={classes.sectionSubtitle}>
          Invitation commission profit margin
        </Text>

        <div className={classes.tableContainer}>
          <Flex justify="space-between" className={classes.tableHeader}>
            <Text size="xs" fw={700} className={classes.flex2}>
              Invitation Method
            </Text>
            <Text size="xs" fw={700} className={classes.flex1Center}>
              Rate
            </Text>
            <Text size="xs" fw={700} className={classes.flex1Right}>
              Income amount
            </Text>
          </Flex>
          {currentData.invitations.map((inv, index) => (
            <Flex
              key={index}
              justify="space-between"
              className={`${classes.tableRow} ${
                index < currentData.invitations.length - 1 ? classes.tableRowBorder : ""
              }`}
            >
              <Text size="xs" className={classes.flex2}>
                {inv.method}
              </Text>
              <Text size="xs" fw={600} className={classes.flex1Center}>
                {inv.rate}
              </Text>
              <Text size="xs" fw={600} className={classes.flex1Right}>
                {inv.amount}
              </Text>
            </Flex>
          ))}
        </div>
      </Box>
    </div>
  );
};

export default LevelTasksScreen;
