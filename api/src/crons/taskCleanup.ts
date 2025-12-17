// import cron from "node-cron";
// import models from "../models";

export const initTaskCleanup = () => {
  // cron.schedule("0 0 * * *", async () => {
  //   try {
  //     const cutoff = new Date();
  //     cutoff.setHours(0, 0, 0, 0); 
  //     await models.taskCompletion.deleteMany({
  //       completedAt: { $lt: cutoff },
  //     });

  //     console.log("🧹 Old task completions cleared successfully at 12 AM");
  //   } catch (err) {
  //     console.error("❌ Failed to clean old task completions:", err);
  //   }
  // });
};