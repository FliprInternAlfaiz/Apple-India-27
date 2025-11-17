import { ObjectId } from "mongoose";
import models from "../../models";

async function createTeamReferrals(referrerId: ObjectId, newUserId: ObjectId) {
  try {
    const newUser = await models.User.findById(newUserId).select('name phone');
    
    await models.TeamReferral.create({
      userId: referrerId,
      referredUserId: newUserId,
      level: "A",
      referralChain: [referrerId, newUserId],
    });

    const referrerUser = await models.User.findById(referrerId);

    if (referrerUser) {
      const levelInfo = await models.level.findOne({
        levelNumber: referrerUser.currentLevelNumber,
        levelName: referrerUser.currentLevel,
      });

      if (levelInfo) {
        const currentTeamLevel = referrerUser.teamLevel || "A";

        let commissionRate = 0;
        if (currentTeamLevel === "A") {
          commissionRate = levelInfo.aLevelCommissionRate;
        } else if (currentTeamLevel === "B") {
          commissionRate = levelInfo.bLevelCommissionRate;
        } else if (currentTeamLevel === "C") {
          commissionRate = levelInfo.cLevelCommissionRate;
        }

        const investmentAmount = levelInfo.investmentAmount || 0;
        const commission = (investmentAmount * commissionRate) / 100;

        referrerUser.mainWallet = (referrerUser.mainWallet || 0) + commission;
        referrerUser.commissionWallet =
          (referrerUser.commissionWallet || 0) + commission;

        await referrerUser.save();

        await models.TeamReferralHistory.create({
          userId: referrerId,
          referredUserId: newUserId,
          referrerUserId: referrerId,
          level: "A",
          amount: commission,
          transactionType: 'signup_bonus',
          status: 'completed',
          description: `Level A commission: ${newUser?.name || 'User'} (${newUser?.phone || 'N/A'}) joined using your referral code. Commission: ${commissionRate}% of ₹${investmentAmount}`,
          referralChain: [referrerId, newUserId],
        });

        console.log(
          `💰 Commission of ₹${commission} added to ${referrerUser.name}'s wallet (Level ${currentTeamLevel})`
        );
      } else {
        console.log("⚠️ Level details not found for referrer");
      }
    }

    const directReferralsCount = await models.TeamReferral.countDocuments({
      userId: referrerId,
      level: "A",
    });

    let teamLevel: "A" | "B" | "C" | null = null;
    if (directReferralsCount >= 3) {
      teamLevel = "C";
    } else if (directReferralsCount >= 2) {
      teamLevel = "C";
    } else if (directReferralsCount >= 1) {
      teamLevel = "B";
    }

    await models.User.findByIdAndUpdate(referrerId, {
      teamLevel: teamLevel,
      directReferralsCount: directReferralsCount,
      totalReferrals: directReferralsCount,
    });

    if (referrerUser && referrerUser.referredBy) {
      await models.TeamReferral.create({
        userId: referrerUser.referredBy,
        referredUserId: newUserId,
        level: "B",
        referralChain: [referrerUser.referredBy, referrerId, newUserId],
      });

      const levelBUser = await models.User.findById(referrerUser.referredBy);
      if (levelBUser) {
        const levelInfo = await models.level.findOne({
          levelNumber: levelBUser.currentLevelNumber,
          levelName: levelBUser.currentLevel,
        });

        if (levelInfo) {
          const commissionRate = levelInfo.bLevelCommissionRate;
          const investmentAmount = levelInfo.investmentAmount || 0;
          const commission = (investmentAmount * commissionRate) / 100;

          levelBUser.mainWallet =
            (levelBUser.mainWallet || 0) + commission;
          levelBUser.commissionWallet =
            (levelBUser.commissionWallet || 0) + commission;

          await levelBUser.save();

          await models.TeamReferralHistory.create({
            userId: referrerUser.referredBy,
            referredUserId: newUserId,
            referrerUserId: referrerId,
            level: "B",
            amount: commission,
            transactionType: 'signup_bonus',
            status: 'completed',
            description: `Level B commission: ${newUser?.name || 'User'} (${newUser?.phone || 'N/A'}) joined through ${referrerUser.name}'s referral. Commission: ${commissionRate}% of ₹${investmentAmount}`,
            referralChain: [referrerUser.referredBy, referrerId, newUserId],
          });

          console.log(
            `💰 Commission of ₹${commission} added to ${levelBUser.name}'s wallet (Level B)`
          );
        }
      }

      if (levelBUser && levelBUser.referredBy) {
        await models.TeamReferral.create({
          userId: levelBUser.referredBy,
          referredUserId: newUserId,
          level: "C",
          referralChain: [
            levelBUser.referredBy,
            referrerUser.referredBy,
            referrerId,
            newUserId,
          ],
        });

        const levelCUser = await models.User.findById(levelBUser.referredBy);
        if (levelCUser) {
          const levelInfo = await models.level.findOne({
            levelNumber: levelCUser.currentLevelNumber,
            levelName: levelCUser.currentLevel,
          });

          if (levelInfo) {
            const commissionRate = levelInfo.cLevelCommissionRate;
            const investmentAmount = levelInfo.investmentAmount || 0;
            const commission = (investmentAmount * commissionRate) / 100;

            levelCUser.mainWallet =
              (levelCUser.mainWallet || 0) + commission;
            levelCUser.commissionWallet =
              (levelCUser.commissionWallet || 0) + commission;

            await levelCUser.save();

            // CREATE HISTORY ENTRY FOR LEVEL C
            await models.TeamReferralHistory.create({
              userId: levelBUser.referredBy,
              referredUserId: newUserId,
              referrerUserId: referrerId,
              level: "C",
              amount: commission,
              transactionType: 'signup_bonus',
              status: 'completed',
              description: `Level C commission: ${newUser?.name || 'User'} (${newUser?.phone || 'N/A'}) joined through ${levelBUser.name}'s network. Commission: ${commissionRate}% of ₹${investmentAmount}`,
              referralChain: [
                levelBUser.referredBy,
                referrerUser.referredBy,
                referrerId,
                newUserId,
              ],
            });

            console.log(
              `💰 Commission of ₹${commission} added to ${levelCUser.name}'s wallet (Level C)`
            );
          }
        }
      }
    }

    return {
      success: true,
      teamLevel: teamLevel,
      directReferralsCount: directReferralsCount,
    };
  } catch (error) {
    console.error("Error creating team referrals:", error);
    throw error;
  }
}

export default createTeamReferrals;