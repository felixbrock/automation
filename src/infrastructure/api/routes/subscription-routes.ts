import { Router } from 'express';
import {
  CreateSubscriptionController,
  ReadSubscriptionController,
  GetSubscriptionAlertsController,
  CreateTargetController,
} from '../controllers';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/subscription-domain';
import DeleteTargetController from '../controllers/delete-target-controller';
import DeleteSubscriptionController from '../controllers/delete-subscription-controller';

const subscriptionRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;

const createSubscriptionController = new CreateSubscriptionController(
  subscriptionDomain.createSubscription
);

const readSubscriptionController = new ReadSubscriptionController(
  subscriptionDomain.readSubscription
);

const deleteSubscriptionController = new DeleteSubscriptionController(
  subscriptionDomain.deleteSubscription
);

const createTargetController = new CreateTargetController(
  subscriptionDomain.createTarget
);

const deleteTargetController = new DeleteTargetController(
  subscriptionDomain.deleteTarget
);

const getSubscriptionAlertsController = new GetSubscriptionAlertsController(
  subscriptionDomain.getSubscriptionAlerts
);

subscriptionRoutes.post('/', (req, res) =>
  createSubscriptionController.execute(req, res)
);

subscriptionRoutes.get('/:subscriptionId', (req, res) =>
  readSubscriptionController.execute(req, res)
);

subscriptionRoutes.delete('/:subscriptionId', (req, res) =>
  deleteSubscriptionController.execute(req, res)
);

subscriptionRoutes.post('/:subscriptionId/target', (req, res) =>
  createTargetController.execute(req, res)
);

subscriptionRoutes.delete('/:subscriptionId/target', (req, res) =>
  deleteTargetController.execute(req, res)
);

subscriptionRoutes.get('/:subscriptionId/alerts', (req, res) =>
  getSubscriptionAlertsController.execute(req, res)
);

export default subscriptionRoutes;
