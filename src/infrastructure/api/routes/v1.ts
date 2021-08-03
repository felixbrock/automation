import { Router } from 'express';
import { apiRoot } from '../../../config';
import automationRoutes from './automation-routes';
import automationsRoutes from './automations-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/automation`, automationRoutes);

v1Router.use(`/${apiRoot}/${version}/automations`, automationsRoutes);

export default v1Router;
