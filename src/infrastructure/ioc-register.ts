import { InjectionMode, asClass, createContainer } from 'awilix';

import SubscriptionDomain from '../domain/subscription-domain';
import AlertDomain from '../domain/alert-domain';

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
import { CreateTarget } from '../domain/use-cases/create-target';
import CreateTargetRepository from './persistence/create-target-repository';
import ReadSystemRepository from './persistence/read-system-repository';
import ReadTargetRepository from './persistence/read-target-repository';
import { ReadTarget } from '../domain/use-cases/read-target';
import { ReadSystem } from '../domain/use-cases/read-system';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  subscriptionDomain: asClass(SubscriptionDomain),
  alertDomain: asClass(AlertDomain),

  createSubscription: asClass(CreateSubscription),
  createTarget: asClass(CreateTarget),
  createAlert: asClass(CreateAlert),
  readSubscription: asClass(ReadSubscription),
  readSubscriptionAlerts: asClass(ReadSubscriptionAlerts),
  readAlert: asClass(ReadAlert),
  readTarget: asClass(ReadTarget),

  readSelector: asClass(ReadSelector),
  readSystem: asClass(ReadSystem),

  createSubscriptionRepository: asClass(CreateSubscriptionRepository),
  createAlertRepository: asClass(CreateAlertRepository),
  readTargetRepository: asClass(CreateTargetRepository),
  readSubscriptionRepository: asClass(ReadSubscriptionRepository),
  readAlertRepository: asClass(ReadAlertRepository),
  createTargetRepository: asClass(ReadTargetRepository),

  readSelectorRepository: asClass(ReadSelectorRepository),
  readSystemRepository: asClass(ReadSystemRepository),
});

const subscriptionMain =
  iocRegister.resolve<SubscriptionDomain>('subscriptionDomain');

const alertMain = iocRegister.resolve<AlertDomain>('alertDomain');

export default {
  subscriptionMain,
  alertMain,
  container: iocRegister,
};
