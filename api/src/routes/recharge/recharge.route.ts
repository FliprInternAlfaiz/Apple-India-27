import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import rechargeQueries from './recharge.queries';


export class RechargeRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'recharge Auth Routes');
    this.app.use('/recharge', this.router);
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

    rechargeQueries(router);
    return this.app;
  }
}
