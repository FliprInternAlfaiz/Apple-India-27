import { ObjectId } from "mongoose";
import models from "../../models";

async function createTeamReferrals(referrerId: ObjectId, newUserId: ObjectId) {
  try {
    await models.TeamReferral.create({
      userId: referrerId,
      referredUserId: newUserId,
      level: 'A',
      referralChain: [referrerId, newUserId],
    });

    const directReferralsCount = await models.TeamReferral.countDocuments({
      userId: referrerId,
      level: 'A'
    });

    let teamLevel: 'A' | 'B' | 'C' | null = null;
    if (directReferralsCount >= 3) {
      teamLevel = 'C';
    } else if (directReferralsCount >= 2) {
      teamLevel = 'B';
    } else if (directReferralsCount >= 1) {
      teamLevel = 'A';
    }

    await models.User.findByIdAndUpdate(referrerId, {
      teamLevel: teamLevel,
      directReferralsCount: directReferralsCount,
      totalReferrals: directReferralsCount
    });

    const referrerUser = await models.User.findById(referrerId);
    if (referrerUser && referrerUser.referredBy) {
      await models.TeamReferral.create({
        userId: referrerUser.referredBy,
        referredUserId: newUserId,
        level: 'B',
        referralChain: [referrerUser.referredBy, referrerId, newUserId],
      });

      const levelBUser = await models.User.findById(referrerUser.referredBy);
      if (levelBUser && levelBUser.referredBy) {
        await models.TeamReferral.create({
          userId: levelBUser.referredBy,
          referredUserId: newUserId,
          level: 'C',
          referralChain: [levelBUser.referredBy, referrerUser.referredBy, referrerId, newUserId],
        });
      }
    }

    return { 
      success: true, 
      teamLevel: teamLevel,
      directReferralsCount: directReferralsCount 
    };
  } catch (error) {
    console.error('Error creating team referrals:', error);
    throw error;
  }
}

export default createTeamReferrals;