import { Router } from 'express';
import { CreateAlertController } from '../controllers';
import app from '../../ioc-register';
import AlertDomain from '../../../domain/alert-domain';

const alertRoutes = Router();
const alertDomain: AlertDomain = app.alertMain;
const createAlertController = new CreateAlertController(alertDomain.createAlert);

alertRoutes.post('/', (req, res) => createAlertController.execute(req, res));

export default alertRoutes;
