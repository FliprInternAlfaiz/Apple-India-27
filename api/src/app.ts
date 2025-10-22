import { config } from 'dotenv';
import express from 'express';

import ExpressConfig from './config/expressConfig';
import Config from './config/serverConfig';
import { cronInit } from './crons';

if (process.env.NODE_ENV === 'test') config({ path: '.env.test' });

const PORT = process.env.PORT ?? 4000;
const app = express();

const serverConfig = new Config();
const experssApp = new ExpressConfig(app, PORT);
cronInit();
serverConfig.start();
const serverApp = experssApp.start();
export default serverApp;
