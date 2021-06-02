import { Router } from 'express';
import {
  CreateSubscriptionController,
  ReadSubscriptionController,
  ReadSubscriptionAlertsController,
} from '../controllers';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/domains/subscription-domain';

const subscriptionRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;

const createSubscriptionController = new CreateSubscriptionController(
  subscriptionDomain.createSubscription
);

const readSubscriptionController = new ReadSubscriptionController(
  subscriptionDomain.readSubscription
);

const readSubscriptionAlertsController = new ReadSubscriptionAlertsController(
  subscriptionDomain.readSubscriptionAlerts
);

subscriptionRoutes.post('/', (req, res) =>
  createSubscriptionController.execute(req, res)
);

subscriptionRoutes.get('/:id', (req, res) =>
  readSubscriptionController.execute(req, res)
);

subscriptionRoutes.get('/:id/alerts', (req, res) =>
  readSubscriptionAlertsController.execute(req, res)
);

export default subscriptionRoutes;
