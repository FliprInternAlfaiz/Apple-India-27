import { initAutoApproveRecharge } from './autoApproveRecharge';
import { initTaskCleanup } from './taskCleanup';

export const cronInit = () => {
  // Initialize individual cron jobs
  initAutoApproveRecharge();
  initTaskCleanup();
};