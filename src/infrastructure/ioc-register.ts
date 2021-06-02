import { InjectionMode, asClass, createContainer } from 'awilix';

import SubscriptionDomain from '../domain/domains/subscription-domain';
import AlertDomain from '../domain/domains/alert-domain';

import { CreateSubscription } from '../domain/use-cases/create-subscription';
import { CreateAlert } from '../domain/use-cases/create-alert';
import { ReadSubscription } from '../domain/use-cases/read-subscription';
import { ReadAlert } from '../domain/use-cases/read-alert';
import { ReadSelector } from '../domain/use-cases/read-selector';

import CreateSubscriptionRepository from './persistence/create-subscription-repository';
import CreateAlertRepository from './persistence/create-alert-repository';
import ReadSubscriptionRepository from './persistence/read-subscription-repository';
import ReadSelectorRepository from './persistence/read-selector-repository';
import ReadAlertRepository from './persistence/read-alert-repository';
import { ReadSubscriptionAlerts } from '../domain/use-cases/read-subscription-alerts';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  subscriptionDomain: asClass(SubscriptionDomain),
  alertDomain: asClass(AlertDomain),

  createSubscription: asClass(CreateSubscription),
  createAlert: asClass(CreateAlert),
  readSubscription: asClass(ReadSubscription),
  readSubscriptionAlerts: asClass(ReadSubscriptionAlerts),
  readSelector: asClass(ReadSelector),
  readAlert: asClass(ReadAlert),

  createSubscriptionRepository: asClass(CreateSubscriptionRepository),
  createAlertRepository: asClass(CreateAlertRepository),
  readSubscriptionRepository: asClass(ReadSubscriptionRepository),
  readSelectorRepository: asClass(ReadSelectorRepository),
  readAlertRepository: asClass(ReadAlertRepository),
});

const subscriptionMain =
  iocRegister.resolve<SubscriptionDomain>('subscriptionDomain');

const alertMain = iocRegister.resolve<AlertDomain>('alertDomain');

export default {
  subscriptionMain,
  alertMain,
  container: iocRegister,
};
