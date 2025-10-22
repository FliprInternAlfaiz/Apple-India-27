import express from 'express';

export abstract class CommonRoutesConfig {
  app: express.Application;
  name: string;
  router: express.Router;

  constructor(app: express.Application, name: string) {
    this.app = app;
    this.name = name;
    this.router = express.Router();
    this.configureRoutes(this.router);
  }

  getName(): string {
    return this.name;
  }

  abstract configureRoutes(router: express.Router): express.Application;
}
