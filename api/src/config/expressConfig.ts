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
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Allowed Origins: ${process.env.ALLOWED_ORIGINS}`);
      routes.forEach((route) => {
        console.log('📍 Listening for route:', route.name);
      });
    });
  }

  private addGlobalMiddlewares() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Get allowed origins from env
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];
    
    console.log('🔒 Allowed Origins:', allowedOrigins);

    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {
        console.log('🌐 Request from origin:', origin);
        
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          console.log('✅ No origin - allowing request');
          return callback(null, true);
        }
        
        // In development, allow all
        if (!isProduction) {
          console.log('✅ Development mode - allowing all origins');
          return callback(null, true);
        }
        
        // In production, check against whitelist
        if (allowedOrigins.includes(origin)) {
          console.log('✅ Origin allowed:', origin);
          callback(null, true);
        } else {
          console.log('❌ Origin not allowed:', origin);
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
    
    console.log('✅ Global middlewares configured');
  }

  private staticServe() {
    this.app.use('/uploads', express.static('uploads'));
    console.log('📦 Static content served');
  }
}

export default ExpressConfig;