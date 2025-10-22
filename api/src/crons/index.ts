import cron from 'node-cron';

export const cronInit = () => {
  cron.schedule('*/10 * * * *', async () => {
  });
  cron.schedule('0 0 * * *', async () => {
  });
};
