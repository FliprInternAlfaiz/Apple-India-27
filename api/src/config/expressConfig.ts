import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { AuthRoutes } from '../routes/auth/auth.routes';
import { TaskRoutes } from '../routes/task/task.routes';
import { WithdrawalRoutes } from '../routes/withdrawal/withdrawal.route';
import { RechargeRoutes } from '../routes/recharge/recharge.route';
import { PaymentRoutes } from '../routes/paymentMethod/paymentMethod.route';
import { levelRoutes } from '../routes/level/level.route';

class ExpressConfig {
  app: express.Application;
  PORT: string | number;

  constructor(app: express.Application, PORT: string | number) {
    this.app = app;
    this.PORT = PORT;
  }

  start() {
    this.addGlobalMiddlewares();
    this.staticServe();

    const routes = [
      new AuthRoutes(this.app),
      new TaskRoutes(this.app),
      new WithdrawalRoutes(this.app),
      new RechargeRoutes(this.app),
      new PaymentRoutes(this.app),
      new levelRoutes(this.app),
    ];

    if (process.env.NODE_ENV !== 'test') this.configureRoutes(routes);
    return this.app;
  }

  private configureRoutes(routes: any[]) {
    return this.app.listen(this.PORT, () => {
      console.log(`✅ Server listening on port: ${this.PORT}`);
      routes.forEach((route) => {
        console.log('📍 Listening for route:', route.name);
      });
    });
  }

  private addGlobalMiddlewares() {
    const allowedOrigins = [
      'https://apple-india-27-web.onrender.com', // Frontend (live)
      'https://apple-india-27.onrender.com', // Backend (self-origin)
      'http://localhost:5173', // Local development
       'http://localhost:5174'
    ];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /\.netlify\.app$/.test(origin) 
      ) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
      })
    );

    // Handle preflight requests
    this.app.options('*', cors());

    // Common middlewares
    this.app.use(express.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    console.log('⚙️ Global middlewares configured successfully');
  }

  private staticServe() {
    this.app.use('/uploads', express.static('uploads'));
    console.log('📦 Static content served successfully');
  }
}

export default ExpressConfig;
