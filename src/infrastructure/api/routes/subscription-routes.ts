import { Router } from 'express';
import {
  CreateSubscriptionController,
  ReadSubscriptionController,
  ReadSubscriptionAlertsController,
} from '../controllers';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/domains/subscription-domain';
import AlertDomain from '../../../domain/domains/alert-domain';
import { ReadSelector } from '../../../domain/use-cases/read-selector';

const subscriptionRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;
const alertDomain: AlertDomain = app.alertMain;

const readSelector: ReadSelector =
  app.container.resolve<ReadSelector>('readSelector');

const createSubscriptionController = new CreateSubscriptionController(
  subscriptionDomain.createSubscription
);
const readSubscriptionController = new ReadSubscriptionController(
  subscriptionDomain.readSubscription
);
const readSubscriptionAlertsController = new ReadSubscriptionAlertsController(
  subscriptionDomain.readSubscription,
  alertDomain.readAlert,
  readSelector
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
