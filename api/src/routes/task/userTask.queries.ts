import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import { Validators } from '../../validators';
import taskController from '../../controllers/taskControllers/task.controller';

const { getTasks, getTaskById, completeTask, createTask } = taskController;

export default (router: Router) => {
  router.get('/get-task', commonsMiddleware.checkUserAuth, getTasks);
  router.get(
    '/get-single-tasks/:taskId',
    commonsMiddleware.checkUserAuth,
    getTaskById,
  );
  router.post(
    '/complete-tasks/:taskId/complete',
    commonsMiddleware.checkUserAuth,
    completeTask,
  );

  router.post(
    '/create-tasks',
    commonsMiddleware.yupValidationMiddleware(Validators.userTask.createTask),
    createTask,
  );
};
