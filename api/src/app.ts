import dotenv from 'dotenv';
import express from 'express';

import ExpressConfig from './config/expressConfig';
import Config from './config/serverConfig';
dotenv.config();
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
}

const PORT = process.env.PORT ?? 4000;
const app = express();

const serverConfig = new Config();
const experssApp = new ExpressConfig(app, PORT);

(async () => {
  try {
    await serverConfig.start();
    experssApp.start();
  } catch (e) {
    console.error('Startup failed:', e);
    process.exit(1);
  }
})();

export default app;