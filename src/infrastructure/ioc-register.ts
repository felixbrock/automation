import { InjectionMode, asClass, createContainer } from 'awilix';

import SubscriptionDomain from '../domain/subscription-domain';

import { CreateSubscription } from '../domain/subscription/create-subscription';
import { ReadSubscription } from '../domain/subscription/read-subscription';
import { GetSubscriptionAlerts } from '../domain/subscription/get-alerts';
import { CreateTarget } from '../domain/target/create-target';
import { GetSelector } from '../domain/selector-api/get-selector';
import { GetSystem } from '../domain/system-api/get-system';
import { GetAccount } from '../domain/account-api/get-account';

import GetSelectorRepository from './persistence/selector-api-repository';
import GetSystemRepository from './persistence/system-api-repository';
import GetAccountRepository from './persistence/account-api-repository';
import SubscriptionRepository from './persistence/subscription-repository';
import { UpdateSubscription } from '../domain/subscription/update-subscription';
import { DeleteTarget } from '../domain/target/delete-target';
import { DeleteSubscription } from '../domain/subscription/delete-subscription';
import { DeleteTargets } from '../domain/target/delete-targets';
import { ReadSubscriptions } from '../domain/subscription/read-subscriptions';
import { UpdateTarget } from '../domain/target/update-target';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  subscriptionDomain: asClass(SubscriptionDomain),

  createSubscription: asClass(CreateSubscription),
  readSubscription: asClass(ReadSubscription),
  readSubscriptions: asClass(ReadSubscriptions),
  updateSubscription: asClass(UpdateSubscription),
  deleteSubscription: asClass(DeleteSubscription),
  
  createTarget: asClass(CreateTarget),
  updateTarget: asClass(UpdateTarget),
  deleteTarget: asClass(DeleteTarget),
  deleteTargets: asClass(DeleteTargets),
  
  getSubscriptionAlerts: asClass(GetSubscriptionAlerts),

  getSelector: asClass(GetSelector),
  getSystem: asClass(GetSystem),
  getAccount: asClass(GetAccount),

  subscriptionRepository: asClass(SubscriptionRepository),

  getSelectorRepository: asClass(GetSelectorRepository),
  getSystemRepository: asClass(GetSystemRepository),
  getAccountRepository: asClass(GetAccountRepository),
});

const subscriptionMain =
  iocRegister.resolve<SubscriptionDomain>('subscriptionDomain');

export default {
  subscriptionMain,
  container: iocRegister,
};
