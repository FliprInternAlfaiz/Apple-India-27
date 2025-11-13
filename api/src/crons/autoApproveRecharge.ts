import cron from 'node-cron';
import models from '../models';

export const initAutoApproveRecharge = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);

      const pendingRecharges = await models.recharge.find({
        status: 'processing',
        submittedAt: { $lte: oneMinuteAgo },
      });

      for (const recharge of pendingRecharges) {
        const user = await models.User.findById(recharge.userId);
        if (!user) continue;

        user.mainWallet = (user.mainWallet || 0) + recharge.amount;
        await user.save();

        recharge.status = 'completed';
        recharge.approvedAt = new Date();
        recharge.remarks = 'Auto-approved by system after 1 minute.';
        await recharge.save();
      }
    } catch (error) {
      console.error('❌ Error in auto-approve cron:', error);
    }
  });
};