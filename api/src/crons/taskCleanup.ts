import cron from "node-cron";
import models from "../models";

const getStartOfTodayIST = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; 
  const istTime = new Date(now.getTime() + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset); 
};

export const initTaskCleanup = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        const startOfToday = getStartOfTodayIST();
        
        const result = await models.taskCompletion.deleteMany({
          completedAt: { $lt: startOfToday }
        });

        console.log(
          `🧹 Daily cleanup: ${result.deletedCount} old task completions deleted at ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}`
        );
        
        console.log(
          `✅ Today's completions are preserved. New day starts at ${startOfToday.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}`
        );
      } catch (err) {
        console.error("❌ Failed to clean up old task completions:", err);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("✅ Task cleanup cron job initialized (runs at 12:00 AM IST daily)");
};

export const initMonthlyReset = () => {
  cron.schedule(
    "1 0 1 * *",
    async () => {
      try {
        const result = await models.User.updateMany(
          {},
          { $set: { monthlyIncome: 0 } }
        );

        console.log(
          `📅 Monthly reset: ${result.modifiedCount} users' monthly income reset at ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}`
        );
      } catch (err) {
        console.error("❌ Failed to reset monthly income:", err);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("✅ Monthly income reset cron job initialized (runs on 1st of every month)");
};