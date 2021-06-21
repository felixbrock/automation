import { InjectionMode, asClass, createContainer } from 'awilix';

import SubscriptionDomain from '../domain/subscription-domain';

import { CreateSubscription } from '../domain/subscription/create-subscription';
import { ReadSubscription } from '../domain/subscription/read-subscription';
import { GetSubscriptionAlerts } from '../domain/get-alerts/get-alerts';
import { CreateTarget } from '../domain/target/create-target';
import { GetSelector } from '../domain/selector-api/get-selector';
import { GetSystem } from '../domain/system-api/get-system';

import GetSelectorRepository from './persistence/selector-api-repository';
import GetSystemRepository from './persistence/system-api-repository';
import SubscriptionRepository from './persistence/subscription-repository';
import { UpdateSubscription } from '../domain/subscription/update-subscription';
import { DeleteTarget } from '../domain/target/delete-target';
import { DeleteSubscription } from '../domain/subscription/delete-subscription';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  subscriptionDomain: asClass(SubscriptionDomain),

  createSubscription: asClass(CreateSubscription),
  readSubscription: asClass(ReadSubscription),
  updateSubscription: asClass(UpdateSubscription),
  deleteSubscription: asClass(DeleteSubscription),
  
  createTarget: asClass(CreateTarget),
  deleteTarget: asClass(DeleteTarget),
  
  getSubscriptionAlerts: asClass(GetSubscriptionAlerts),

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
