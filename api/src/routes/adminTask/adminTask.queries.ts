import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import { handleMulterError, uploadSingleVideo } from '../../middleware/upload.middleware';
import adminTaskController from '../../controllers/adminTaskControllers/adminTask.controller';

const { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskStatus 
} = adminTaskController;

export default (router: Router) => {
  router.get(
    '/tasks',
    commonsMiddleware.checkAdminAuth,
    getAllTasks
  );

  router.get(
    '/tasks/:taskId',
    commonsMiddleware.checkAdminAuth,
    getTaskById
  );

  router.post(
    '/tasks',
    commonsMiddleware.checkAdminAuth,
    uploadSingleVideo,
    handleMulterError,
    createTask
  );

  router.put(
    '/tasks/:taskId',
    commonsMiddleware.checkAdminAuth,
    uploadSingleVideo,
    handleMulterError,
    updateTask
  );

  router.delete(
    '/tasks/:taskId',
    commonsMiddleware.checkAdminAuth,
    deleteTask
  );

  router.patch(
    '/tasks/:taskId/toggle-status',
    commonsMiddleware.checkAdminAuth,
    toggleTaskStatus
  );
};

