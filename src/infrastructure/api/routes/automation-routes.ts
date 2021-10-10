import { Router } from 'express';
import CreateAutomationController from '../controllers/create-automation-controller';
import ReadAutomationController from '../controllers/read-automation-controller';
import CreateSubscriptionController from '../controllers/create-subscription-controller';
import app from '../../ioc-register';
import AutomationDomain from '../../../domain/automation-domain';
import DeleteSubscriptionController from '../controllers/delete-subscription-controller';
import DeleteAutomationController from '../controllers/delete-automation-controller';
import UpdateSubscriptionsController from '../controllers/update-subscriptions-controller';

const automationRoutes = Router();

const automationDomain: AutomationDomain = app.automationMain;

const createAutomationController = new CreateAutomationController(
  automationDomain.createAutomation,
  app.container.resolve('getAccounts')
);

const readAutomationController = new ReadAutomationController(
  automationDomain.readAutomation,
  app.container.resolve('getAccounts')
);

const deleteAutomationController = new DeleteAutomationController(
  automationDomain.deleteAutomation,
  app.container.resolve('getAccounts')
);

const createSubscriptionController = new CreateSubscriptionController(
  automationDomain.createSubscription,
  app.container.resolve('getAccounts')
);

const updateSubscriptionsController = new UpdateSubscriptionsController(
  automationDomain.updateSubscriptions,
  app.container.resolve('getAccounts')
);

const deleteSubscriptionController = new DeleteSubscriptionController(
  automationDomain.deleteSubscription,
  app.container.resolve('getAccounts')
);

automationRoutes.post('/', (req, res) =>
  createAutomationController.execute(req, res)
);

automationRoutes.get('/:automationId', (req, res) =>
  readAutomationController.execute(req, res)
);

automationRoutes.delete('/:automationId', (req, res) =>
  deleteAutomationController.execute(req, res)
);

automationRoutes.post('/:automationId/subscription', (req, res) =>
  createSubscriptionController.execute(req, res)
);

automationRoutes.patch('/:automationId/subscriptions', (req, res) =>
  updateSubscriptionsController.execute(req, res)
);

automationRoutes.delete('/:automationId/subscription', (req, res) =>
  deleteSubscriptionController.execute(req, res)
);

export default automationRoutes;
