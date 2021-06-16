import { Router } from 'express';
import {
  CreateSubscriptionController,
  ReadSubscriptionController,
  GetSubscriptionAlertsController,
  CreateTargetController,
} from '../controllers';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/subscription-domain';

const subscriptionRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;

const createSubscriptionController = new CreateSubscriptionController(
  subscriptionDomain.createSubscription
);

const createTargetController = new CreateTargetController(
  subscriptionDomain.createTarget
);

const readSubscriptionController = new ReadSubscriptionController(
  subscriptionDomain.readSubscription
);

const getSubscriptionAlertsController = new GetSubscriptionAlertsController(
  subscriptionDomain.getSubscriptionAlerts
);

subscriptionRoutes.post('/', (req, res) =>
  createSubscriptionController.execute(req, res)
);

subscriptionRoutes.post(':subscriptionId/target', (req, res) =>
  createTargetController.execute(req, res)
);

subscriptionRoutes.get('/:subscriptionId', (req, res) =>
  readSubscriptionController.execute(req, res)
);

subscriptionRoutes.get('/:subscriptionId/alerts', (req, res) =>
  getSubscriptionAlertsController.execute(req, res)
);

export default subscriptionRoutes;
