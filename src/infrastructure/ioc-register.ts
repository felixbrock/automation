import { InjectionMode, asClass, createContainer } from 'awilix';

import AutomationDomain from '../domain/automation-domain';

import { CreateAutomation } from '../domain/automation/create-automation';
import { ReadAutomation } from '../domain/automation/read-automation';
import { GetAutomationAlerts } from '../domain/automation/get-alerts';
import { CreateSubscription } from '../domain/subscription/create-subscription';
import { GetSelector } from '../domain/selector-api/get-selector';
import { GetSystem } from '../domain/system-api/get-system';
import { GetAccount } from '../domain/account-api/get-account';

import GetSelectorRepository from './persistence/selector-api-repository';
import GetSystemRepository from './persistence/system-api-repository';
import GetAccountRepository from './persistence/account-api-repository';
import AutomationRepository from './persistence/automation-repository';
import { UpdateAutomation } from '../domain/automation/update-automation';
import { DeleteSubscription } from '../domain/subscription/delete-subscription';
import { DeleteAutomation } from '../domain/automation/delete-automation';
import { DeleteSubscriptions } from '../domain/subscription/delete-subscriptions';
import { ReadAutomations } from '../domain/automation/read-automations';
import { UpdateSubscriptions } from '../domain/subscription/update-subscriptions';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  automationDomain: asClass(AutomationDomain),

  createAutomation: asClass(CreateAutomation),
  readAutomation: asClass(ReadAutomation),
  readAutomations: asClass(ReadAutomations),
  updateAutomation: asClass(UpdateAutomation),
  deleteAutomation: asClass(DeleteAutomation),
  
  createSubscription: asClass(CreateSubscription),
  updateSubscriptions: asClass(UpdateSubscriptions),
  deleteSubscription: asClass(DeleteSubscription),
  deleteSubscriptions: asClass(DeleteSubscriptions),
  
  getAutomationAlerts: asClass(GetAutomationAlerts),

  getSelector: asClass(GetSelector),
  getSystem: asClass(GetSystem),
  getAccount: asClass(GetAccount),

  automationRepository: asClass(AutomationRepository),

  getSelectorRepository: asClass(GetSelectorRepository),
  getSystemRepository: asClass(GetSystemRepository),
  getAccountRepository: asClass(GetAccountRepository),
});

const automationMain =
  iocRegister.resolve<AutomationDomain>('automationDomain');

export default {
  automationMain,
  container: iocRegister,
};
