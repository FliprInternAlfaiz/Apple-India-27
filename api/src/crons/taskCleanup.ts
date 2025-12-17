import cron from "node-cron";
import models from "../models";

export const initTaskCleanup = () => {
  cron.schedule(
    "0 0 * * *", 
    async () => {
      try {
        const result = await models.taskCompletion.deleteMany({});

        console.log(
          `🎥 Daily video rewards reset: ${result.deletedCount} entries deleted at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
        );
      } catch (err) {
        console.error("❌ Failed to reset daily video rewards:", err);
      }
    },
    {
      timezone: "Asia/Kolkata",
    }
  );
};
