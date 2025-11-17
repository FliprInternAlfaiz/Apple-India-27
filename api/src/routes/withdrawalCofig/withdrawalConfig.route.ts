import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import withdrawlConfigQueries from './withdrawlConfig.queries';


export class WithdrawalConfigRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'Withdrawal Config Auth Routes');
    this.app.use('/withdrawalConfig', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'Config api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    withdrawlConfigQueries(router);
    return this.app;
  }
}
