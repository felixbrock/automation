import { InjectionMode, asClass, createContainer } from 'awilix';

import SubscriptionDomain from '../domain/subscription-domain';

import { CreateSubscription } from '../domain/subscription/create-subscription';
import { ReadSubscription } from '../domain/subscription/read-subscription';
import { ReadSubscriptionAlerts } from '../domain/alerts/read-alerts';
import { CreateTarget } from '../domain/target/create-target';
import { GetSelector } from '../domain/selector/get-selector';
import { GetSystem } from '../domain/system/get-system';

import GetSelectorRepository from './persistence/get-selector-repository';
import GetSystemRepository from './persistence/get-system-repository';
import SubscriptionRepository from './persistence/subscription-repository';
import { UpdateSubscription } from '../domain/subscription/update-subscription';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  subscriptionDomain: asClass(SubscriptionDomain),

  createSubscription: asClass(CreateSubscription),
  createTarget: asClass(CreateTarget),
  readSubscription: asClass(ReadSubscription),
  updateSubscription: asClass(UpdateSubscription),
  readSubscriptionAlerts: asClass(ReadSubscriptionAlerts),

  getSelector: asClass(GetSelector),
  getSystem: asClass(GetSystem),

  subscriptionRepository: asClass(SubscriptionRepository),

  getSelectorRepository: asClass(GetSelectorRepository),
  getSystemRepository: asClass(GetSystemRepository),
});

const subscriptionMain =
  iocRegister.resolve<SubscriptionDomain>('subscriptionDomain');

export default {
  subscriptionMain,
  container: iocRegister,
};
