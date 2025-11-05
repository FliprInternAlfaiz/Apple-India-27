import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import verificationQueries from './verification.queries';


export class verificationRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'verificationRoutes');
    this.app.use('/verification', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'verification api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    verificationQueries(router);
    return this.app;
  }
}
