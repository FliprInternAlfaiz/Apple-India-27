import { Router } from 'express';
import levelController from '../../controllers/levelControllers/level.controller';
import { commonsMiddleware } from '../../middleware';

export default (router: Router) => {
  router.get('/get',commonsMiddleware.checkUserAuth, levelController.getAllLevels);
  router.get('/name/:levelName',commonsMiddleware.checkUserAuth, levelController.getLevelByName);
  router.get('/number/:levelNumber',commonsMiddleware.checkUserAuth, levelController.getLevelByNumber);

  router.post('/upgrade', commonsMiddleware.checkUserAuth, levelController.upgradeUserLevel);

  router.post('/create', commonsMiddleware.checkUserAuth, levelController.createLevel);
  router.put('/update/:levelId', commonsMiddleware.checkUserAuth, levelController.updateLevel);

  return router;
};
