import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import withdrawalQueries from './withdrawal.queries';


export class WithdrawalRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'Withdrawal Auth Routes');
    this.app.use('/withdrawal', this.router);
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

    withdrawalQueries(router);
    return this.app;
  }
}
