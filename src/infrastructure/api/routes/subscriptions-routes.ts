import { Router } from 'express';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/subscription-domain';
import DeleteTargetsController from '../controllers/delete-targets-controller';
import ReadSubscriptionsController from '../controllers/read-subscriptions-controller';

const subscriptionsRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;

const deleteTargetsController = new DeleteTargetsController(
  subscriptionDomain.deleteTargets
);

const readSubscriptionsController = new ReadSubscriptionsController(
  subscriptionDomain.readSubscriptions
);

subscriptionsRoutes.get('/', (req, res) =>
readSubscriptionsController.execute(req, res)
);

subscriptionsRoutes.delete('/targets', (req, res) =>
  deleteTargetsController.execute(req, res)
);

export default subscriptionsRoutes;
