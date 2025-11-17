import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import withdrawalConfigController from '../../controllers/withdrawalConfigControllers/withdrawalConfig.controller';

export default (router: Router) => {
  router.get(
    '/withdrawal-configs',
    commonsMiddleware.checkAdminAuth,
    withdrawalConfigController.getWithdrawalConfigs,
  );

  router.put(
    '/withdrawal-configs/:dayOfWeek',
    commonsMiddleware.checkAdminAuth,
    withdrawalConfigController.updateWithdrawalConfig,
  );

  router.post(
    '/withdrawal-configs/bulk',
    commonsMiddleware.checkAdminAuth,
    withdrawalConfigController.bulkUpdateConfigs,
  );
};
