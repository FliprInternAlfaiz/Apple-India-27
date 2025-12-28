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
import { TeamRoutes } from '../routes/team/team.routes';
import { verificationRoutes } from '../routes/verification/verification.route';
import { ConferenceNewsRoutes } from '../routes/conferenceNews/conferenceNews.route';
import { luckydrawRoutes } from '../routes/luckydraw/luckydraw.route';
import { userManagementRoutes } from '../routes/userManagement/userManagment.routes';
import { AdminTaskRoutes } from '../routes/adminTask/adminTask.routes';
import { WithdrawalConfigRoutes } from '../routes/withdrawalCofig/withdrawalConfig.route';
import { USDWithdrawalRoutes } from '../routes/usdWithdrawal/usdWithdrawal.route';

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
      new TeamRoutes(this.app),
      new verificationRoutes(this.app),
      new ConferenceNewsRoutes(this.app),
      new luckydrawRoutes(this.app),
      new userManagementRoutes(this.app),
      new AdminTaskRoutes(this.app),
      new WithdrawalConfigRoutes(this.app),
      new USDWithdrawalRoutes(this.app),
    ];

    if (process.env.NODE_ENV !== 'test') this.configureRoutes(routes);
    return this.app;
  }

  private configureRoutes(routes: any[]) {
    return this.app.listen(this.PORT, () => {
      routes.forEach((route) => {
        console.log('📍 Listening for route:', route.name);
      });
    });
  }

  private addGlobalMiddlewares() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];
    

    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {
        
        if (!origin) {
          return callback(null, true);
        }
        
        if (!isProduction) {
          return callback(null, true);
        }
        
        // In production, check against whitelist
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false); // Don't throw error, just deny
        }
      },
      credentials: true, // CRITICAL: Allow cookies and authorization headers
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400, // 24 hours
      optionsSuccessStatus: 200
    };

    // Apply CORS
    this.app.use(cors(corsOptions));
    this.app.options('*', cors(corsOptions));

    // Parse cookies
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    
  }

  private staticServe() {
    this.app.use('/uploads', express.static('uploads'));
  }
}

export default ExpressConfig;