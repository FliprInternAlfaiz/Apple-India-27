import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import teamQueiries from './userManagment.queiries';

export class userManagementRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'team Routes');
    this.app.use('/admin', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'user management api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    teamQueiries(router);
    return this.app;
  }
}
