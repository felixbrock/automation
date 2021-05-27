import { Router } from 'express';
import { apiRoot } from '../../../config';
import subscriptionRoutes from './subscription-routes';
import alertRoutes from './alert-routes';

const version = 'v1';

const v1Router = Router();

v1Router.get('/', (req, res) => res.json({ message: "Yo! We're up!" }));

v1Router.use(`/${apiRoot}/${version}/subscription`, subscriptionRoutes);

v1Router.use(`/${apiRoot}/${version}/alert`, alertRoutes);

export default v1Router;
