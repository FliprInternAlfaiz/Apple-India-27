// scripts/seedLevels.ts
import models from "../models";

export const seedLevelsData = async () => {
  try {
    const levelsData = [
      {
        levelNumber: 1,
        levelName: "Apple1",
        investmentAmount: 0, // Free tier
        rewardPerTask: 40,
        dailyTaskLimit: 6,
        aLevelCommissionRate: 8,
        bLevelCommissionRate: 3,
        cLevelCommissionRate: 1,
        isActive: true,
        order: 1,
        icon: '🍏',
        description: 'Start earning with free tasks',
      },
      {
        levelNumber: 2,
        levelName: "Apple2",
        investmentAmount: 12000,
        rewardPerTask: 50,
        dailyTaskLimit: 8,
        aLevelCommissionRate: 10,
        bLevelCommissionRate: 4,
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
        aLevelCommissionRate: 12,
        bLevelCommissionRate: 5,
        cLevelCommissionRate: 2,
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
        aLevelCommissionRate: 15,
        bLevelCommissionRate: 6,
        cLevelCommissionRate: 3,
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
        aLevelCommissionRate: 18,
        bLevelCommissionRate: 7,
        cLevelCommissionRate: 4,
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