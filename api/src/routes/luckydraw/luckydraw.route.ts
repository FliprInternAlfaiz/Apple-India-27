import express, { Request, Response } from "express";
import { JsonResponse } from "../../utils/jsonResponse";
import { CommonRoutesConfig } from "../../lib/CommonRoutesConfig";
import luckydrawQueries from "./luckydraw.queries";

export class luckydrawRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "luckydrawRoutes");
    this.app.use("/luckydraw", this.router);
  }

  configureRoutes(router: express.Router): express.Application {
    router.get("/", (_: Request, res: Response) => {
      return JsonResponse(res, {
        statusCode: 200,
        title: "Lucky Draw API",
        status: "success",
        message: "Lucky Draw route working successfully",
      });
    });

    // Map all Lucky Draw routes
    luckydrawQueries(router);

    return this.app;
  }
}
