// routes/usdWithdrawal/usdWithdrawal.route.ts
import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import usdWithdrawalQueries from './usdWithdrawal.queries';

export class USDWithdrawalRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'USD Withdrawal Routes');
    this.app.use('/usd-withdrawal', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'USD Withdrawal API',
        status: 'success',
        message: 'USD Withdrawal API is working',
      });
    });

    usdWithdrawalQueries(router);
    return this.app;
  }
}
