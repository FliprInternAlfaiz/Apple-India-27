import { initTaskCleanup, initMonthlyReset } from './taskCleanup';

export const cronInit = () => {
  console.log('🚀 Initializing cron jobs...');
  
  initTaskCleanup();
  
  initMonthlyReset();
  
  console.log('✅ All cron jobs initialized successfully');
};