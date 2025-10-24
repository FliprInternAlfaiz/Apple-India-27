import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import { Validators } from "../../validators";
import taskController from "../../controllers/taskControllers/task.controller";

const { getTasks, createTask } = taskController;

export default (router: Router) => {
  router.get("/get-task", getTasks);

  router.post(
    "/create-tasks",
    commonsMiddleware.yupValidationMiddleware(Validators.userTask.createTask),
    createTask
  );
};