import { Router } from 'express';
import app from '../../ioc-register';
import SubscriptionDomain from '../../../domain/subscription-domain';
import DeleteTargetsController from '../controllers/delete-targets-controller';

const subscriptionsRoutes = Router();

const subscriptionDomain: SubscriptionDomain = app.subscriptionMain;

const deleteTargetsController = new DeleteTargetsController(
  subscriptionDomain.deleteTargets
);

subscriptionsRoutes.delete('/targets', (req, res) =>
  deleteTargetsController.execute(req, res)
);

export default subscriptionsRoutes;
