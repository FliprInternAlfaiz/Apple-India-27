import crypto from "crypto";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export const generateReferralCode = async (): Promise<string> => {
  let code: string;
  let exists = true;

  while (exists) {
    code = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
    const user = await models.User.findOne({ referralCode: code });
    exists = !!user;
  }

  return code!;
};

export const processReferralChain = async (newUserId: string, referrerCode: string) => {
  try {
    const referrer = await models.User.findOne({ referralCode: referrerCode });
    if (!referrer) {
      console.log("❌ Referrer not found for code:", referrerCode);
      return;
    }

    await models.User.findByIdAndUpdate(referrer._id, {
      $inc: { totalReferrals: 1 },
    });

    // Level A
    await models.TeamReferral.create({
      userId: referrer._id,
      referredUserId: newUserId,
      level: "A",
      referralChain: [referrer._id],
    });

    // Level B
    const referrerTeam = await models.TeamReferral.findOne({
      referredUserId: referrer._id,
      level: "A",
    });

    if (referrerTeam) {
      await models.TeamReferral.create({
        userId: referrerTeam.userId,
        referredUserId: newUserId,
        level: "B",
        referralChain: [referrerTeam.userId, referrer._id],
      });

      // Level C
      const levelBTeam = await models.TeamReferral.findOne({
        referredUserId: referrerTeam.userId,
        level: "A",
      });

      if (levelBTeam) {
        await models.TeamReferral.create({
          userId: levelBTeam.userId,
          referredUserId: newUserId,
          level: "C",
          referralChain: [levelBTeam.userId, referrerTeam.userId, referrer._id],
        });
      }
    }

    console.log("🎯 Referral chain processed successfully for:", newUserId);
  } catch (error) {
    console.error("💥 Error processing referral chain:", error);
  }
};
