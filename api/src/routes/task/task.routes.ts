import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import userTaskQueries from './userTask.queries';


export class TaskRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'Task Routes');
    this.app.use('/task', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'task api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    userTaskQueries(router);
    return this.app;
  }
}
