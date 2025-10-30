import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import levelQueries from './level.queries';


export class levelRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'level Auth Routes');
    this.app.use('/level', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'level api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    levelQueries(router);
    return this.app;
  }
}
