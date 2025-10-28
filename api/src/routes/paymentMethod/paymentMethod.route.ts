import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import paymentMethodQueries from './paymentMethod.queries';


export class PaymentRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'payment Auth Routes');
    this.app.use('/payment', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'payment api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    paymentMethodQueries(router);
    return this.app;
  }
}
