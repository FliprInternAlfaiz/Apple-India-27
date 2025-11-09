import express, { Request, Response } from 'express';
import userAuthQueries from './userAuth.queries';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import adminAuthQueries from './adminAuth.queries';

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'Auth Routes');
    this.app.use('/auth', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'auth api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    userAuthQueries(router);
    adminAuthQueries(router);
    return this.app;
  }
}
