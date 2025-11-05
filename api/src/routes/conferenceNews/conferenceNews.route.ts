import express, { Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';
import { CommonRoutesConfig } from '../../lib/CommonRoutesConfig';
import conferenceNewsQueries from './conferenceNews.queries';


export class ConferenceNewsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'conferenceNewsRoutes');
    this.app.use('/conferenceNews', this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get('/', (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: 'ConferenceNewsRoutes api called',
        status: 'success',
        message: 'api called successfully',
      });
    });

    conferenceNewsQueries(router);
    return this.app;
  }
}
