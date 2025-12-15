import { ObjectId } from "mongoose";
import models from "../../models";

async function createTeamReferrals(referrerId: ObjectId, newUserId: ObjectId) {
  try {
    const newUser = await models.User.findById(newUserId).select("name phone referredBy");
    const referrer = await models.User.findById(referrerId).select("name phone referredBy");

    if (!newUser || !referrer) {
      throw new Error("User or referrer not found");
    }

    await models.TeamReferral.create({
      userId: referrerId,
      referredUserId: newUserId,
      level: "A",
      referralChain: [referrerId, newUserId],
      isActive: true,
      totalEarnings: 0,
    });

    await models.TeamReferralHistory.create({
      userId: referrerId,
      referredUserId: newUserId,
      referrerUserId: referrerId,
      level: "A",
      amount: 0,
      transactionType: "signup_bonus",
      status: "pending",
      description: `${newUser.name || "User"} (${newUser.phone || "N/A"}) signed up using your referral code. Commission will be credited when they purchase their first level.`,
      referralChain: [referrerId, newUserId],
    });

    console.log(`✅ Level A referral created: ${newUserId} → ${referrerId}`);

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
    console.error("❌ Error creating team referrals:", error);
    throw error;
  }
}

export async function processReferralCommissions(userId: ObjectId, purchasedLevel: any) {
  try {
    const user = await models.User.findById(userId).select("name phone referredBy");
    if (!user) {
      return { success: false, message: "User not found" };
    }

    const pendingReferrals = await models.TeamReferralHistory.find({
      referredUserId: userId,
      status: "pending",
      transactionType: "signup_bonus",
      level: "A",
    }).populate("userId", "name phone mainWallet");

    if (pendingReferrals.length === 0) {
      console.log(`ℹ️ No pending Level A referrals found for user: ${userId}`);
      return { success: true, message: "No pending referrals to process" };
    }

    for (const referral of pendingReferrals) {
      const commissionRate = purchasedLevel.aLevelCommissionRate || 0;
      const commissionAmount = (purchasedLevel.investmentAmount * commissionRate) / 100;

      const referrerUser = await models.User.findById(referral.userId);
      if (referrerUser) {
        referrerUser.mainWallet = (referrerUser.mainWallet || 0) + commissionAmount;
        await referrerUser.save();

        console.log(`✅ Updated ${referrerUser.name}'s wallet: +₹${commissionAmount}`);
      }

      referral.status = "completed";
      referral.amount = commissionAmount;
      referral.transactionType = "investment_commission";
      referral.investmentAmount = purchasedLevel.investmentAmount;
      referral.commissionPercentage = commissionRate;
      referral.description = `${user.name || "User"} (${user.phone || "N/A"}) purchased ${
        purchasedLevel.levelName
      }. You earned ₹${commissionAmount.toFixed(2)} (${commissionRate}% commission).`;
      await referral.save();

      await models.TeamReferral.findOneAndUpdate(
        { userId: referral.userId, referredUserId: userId, level: "A" },
        { $inc: { totalEarnings: commissionAmount } }
      );

      console.log(`✅ Level A referral commission processed`);
    }

    console.log(`🎉 Successfully processed ${pendingReferrals.length} Level A referral commissions`);
    return {
      success: true,
      message: `Processed ${pendingReferrals.length} Level A referral commissions`,
      commissionsProcessed: pendingReferrals.length,
    };
  } catch (error) {
    console.error("❌ Error processing referral commissions:", error);
    return {
      success: false,
      message: "Error processing referral commissions",
      error: error,
    };
  }
}

export default createTeamReferrals;