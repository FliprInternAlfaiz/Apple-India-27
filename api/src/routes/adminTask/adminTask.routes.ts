import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import adminTaskQueries from './adminTask.queries';


export class AdminTaskRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'Task Routes');
    this.app.use('/admin', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'Admin task api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    adminTaskQueries(router);
    return this.app;
  }
}
