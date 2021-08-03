import { Router } from 'express';
import CreateAutomationController from '../controllers/create-automation-controller';
import ReadAutomationController from '../controllers/read-automation-controller';
import GetAutomationAlertsController from '../controllers/read-automation-alerts-controller';
import CreateSubscriptionController from '../controllers/create-subscription-controller';
import app from '../../ioc-register';
import AutomationDomain from '../../../domain/automation-domain';
import DeleteSubscriptionController from '../controllers/delete-subscription-controller';
import DeleteAutomationController from '../controllers/delete-automation-controller';
import UpdateSubscriptionController from '../controllers/update-subscription-controller';

const automationRoutes = Router();

const automationDomain: AutomationDomain = app.automationMain;

const createAutomationController = new CreateAutomationController(
  automationDomain.createAutomation
);

const readAutomationController = new ReadAutomationController(
  automationDomain.readAutomation
);

const deleteAutomationController = new DeleteAutomationController(
  automationDomain.deleteAutomation
);

const createSubscriptionController = new CreateSubscriptionController(
  automationDomain.createSubscription
);

const updateSubscriptionController = new UpdateSubscriptionController(
  automationDomain.updateSubscription
);

const deleteSubscriptionController = new DeleteSubscriptionController(
  automationDomain.deleteSubscription
);

const getAutomationAlertsController = new GetAutomationAlertsController(
  automationDomain.getAutomationAlerts
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

automationRoutes.patch('/:automationId/subscription', (req, res) =>
  updateSubscriptionController.execute(req, res)
);

automationRoutes.delete('/:automationId/subscription', (req, res) =>
  deleteSubscriptionController.execute(req, res)
);

automationRoutes.get('/:automationId/alerts', (req, res) =>
  getAutomationAlertsController.execute(req, res)
);

export default automationRoutes;
