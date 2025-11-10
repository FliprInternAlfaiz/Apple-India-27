import { Router } from 'express';
import levelController from '../../controllers/levelControllers/level.controller';
import { commonsMiddleware } from '../../middleware';

export default (router: Router) => {
  router.get('/get',commonsMiddleware.checkUserAuth, levelController.getAllLevels);
  router.get('/name/:levelName',commonsMiddleware.checkUserAuth, levelController.getLevelByName);
  router.get('/number/:levelNumber',commonsMiddleware.checkUserAuth, levelController.getLevelByNumber);

  router.post('/upgrade', commonsMiddleware.checkUserAuth, levelController.upgradeUserLevel);

  router.put('/update/:levelId', commonsMiddleware.checkUserAuth, levelController.updateLevel);


  router.get(
    '/admin/levels',
    commonsMiddleware.checkAdminAuth,
    levelController.getAllLevelsAdmin
  );

  // Create new level (Admin)
  router.post(
    '/admin/levels',
    commonsMiddleware.checkAdminAuth,
    levelController.createLevel
  );
  
  // Update level (Admin)
  router.put(
    '/admin/levels/:levelId',
    commonsMiddleware.checkAdminAuth,
    levelController.updateLevel
  );

  // Delete level (Admin)
  router.delete(
    '/admin/levels/:levelId',
    commonsMiddleware.checkAdminAuth,
    levelController.deleteLevel
  );


  return router;
};
