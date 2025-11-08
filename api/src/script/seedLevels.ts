import models from "../models";

export const seedLevelsData = async () => {
  try {
    const levelsData = [
      {
        levelNumber: 0,
        levelName: "AppleMini",
        investmentAmount: 1800,
        rewardPerTask: 15,
        dailyTaskLimit: 4,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 0,
        icon: '🍏',
        description: 'Entry level - Watch 4 videos = Earn ₹60/day',
      },
      {
        levelNumber: 1,
        levelName: "Apple1",
        investmentAmount: 6000,
        rewardPerTask: 25,
        dailyTaskLimit: 8,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 1,
        icon: '🍎',
        description: 'Watch 8 videos = Earn ₹200/day',
      },
      {
        levelNumber: 2,
        levelName: "Apple2",
        investmentAmount: 12000,
        rewardPerTask: 50,
        dailyTaskLimit: 8,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 2,
        icon: '🍎',
        description: 'Watch 8 videos = Earn ₹400/day',
      },
      {
        levelNumber: 3,
        levelName: "Apple3",
        investmentAmount: 23000,
        rewardPerTask: 60,
        dailyTaskLimit: 12,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 3,
        icon: '🍏',
        description: 'Watch 12 videos = Earn ₹720/day',
      },
      {
        levelNumber: 4,
        levelName: "Apple4",
        investmentAmount: 42000,
        rewardPerTask: 80,
        dailyTaskLimit: 16,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 4,
        icon: '🍎',
        description: 'Watch 16 videos = Earn ₹1,280/day',
      },
      {
        levelNumber: 5,
        levelName: "Apple5",
        investmentAmount: 60000,
        rewardPerTask: 90,
        dailyTaskLimit: 20,
        aLevelCommissionRate: 5,
        bLevelCommissionRate: 2,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 5,
        icon: '💎',
        description: 'Watch 20 videos = Earn ₹1,800/day',
      },
    ];

    await models.level.deleteMany({});
    const createdLevels = await models.level.insertMany(levelsData);

    console.log(`✅ Successfully seeded ${createdLevels.length} levels`);
    return createdLevels;
  } catch (error) {
    console.error("❌ Error seeding levels:", error);
    throw error;
  }
};