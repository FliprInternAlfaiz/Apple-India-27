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
        const commissionRate = levelInfo.aLevelCommissionRate;
        const investmentAmount = levelInfo.investmentAmount || 0;
        const commission = (investmentAmount * commissionRate) / 100;

        referrerUser.mainWallet = (referrerUser.mainWallet || 0) + commission;

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
      } else {
        console.log("⚠️ Level details not found for referrer");
      }
    }

    const directReferralsCount = await models.TeamReferral.countDocuments({
      userId: referrerId,
      level: "A",
    });

    await models.User.findByIdAndUpdate(referrerId, {
      directReferralsCount: directReferralsCount,
      totalReferrals: directReferralsCount,
    });

    return {
      success: true,
      directReferralsCount: directReferralsCount,
    };
  } catch (error) {
    console.error("Error creating team referrals:", error);
    throw error;
  }
}

export default createTeamReferrals;