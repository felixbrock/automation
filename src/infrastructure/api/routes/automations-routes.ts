import { Router } from 'express';
import app from '../../ioc-register';
import AutomationDomain from '../../../domain/automation-domain';
import DeleteSubscriptionsController from '../controllers/delete-subscriptions-controller';
import ReadAutomationsController from '../controllers/read-automations-controller';

const automationsRoutes = Router();

const automationDomain: AutomationDomain = app.automationMain;

const deleteSubscriptionsController = new DeleteSubscriptionsController(
  automationDomain.deleteSubscriptions,
  app.container.resolve('getAccounts')
);

const readAutomationsController = new ReadAutomationsController(
  automationDomain.readAutomations,
  app.container.resolve('getAccounts')
);

automationsRoutes.get('/', (req, res) =>
  readAutomationsController.execute(req, res)
);

automationsRoutes.delete('/subscriptions', (req, res) =>
  deleteSubscriptionsController.execute(req, res)
);

export default automationsRoutes;
