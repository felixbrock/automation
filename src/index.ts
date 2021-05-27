import dotenv from 'dotenv';

dotenv.config();

// eslint-disable-next-line import/first
import ExpressApp from './infrastructure/api/express-app';
// eslint-disable-next-line import/first
import { appConfig } from './config';

// TODO Figure out devdependencies and dependencies package.json
const expressApp = new ExpressApp(appConfig.express);

expressApp.start();
