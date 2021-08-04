import { CreateAutomation } from './automation/create-automation';
import { CreateSubscription } from './subscription/create-subscription';
import { ReadAutomation } from './automation/read-automation';
import { GetAutomationAlerts } from './automation/get-alerts';
import { UpdateAutomation } from './automation/update-automation';
import { DeleteSubscription } from './subscription/delete-subscription';
import { DeleteAutomation } from './automation/delete-automation';
import { ReadAutomations } from './automation/read-automations';
import { DeleteSubscriptions } from './subscription/delete-subscriptions';
import { UpdateSubscriptions } from './subscription/update-subscriptions';

export default class AutomationDomain {
  #createAutomation: CreateAutomation;
  
  #updateAutomation: UpdateAutomation;

  #readAutomation: ReadAutomation;

  #readAutomations: ReadAutomations;

  #deleteAutomation: DeleteAutomation;

  #createSubscription: CreateSubscription;

  #updateSubscriptions: UpdateSubscriptions;

  #deleteSubscription: DeleteSubscription;

  #deleteSubscriptions: DeleteSubscriptions;

  #getAutomationAlerts: GetAutomationAlerts;

  public get createAutomation(): CreateAutomation {
    return this.#createAutomation;
  }

  public get updateAutomation(): UpdateAutomation {
    return this.#updateAutomation;
  }

  public get readAutomation(): ReadAutomation {
    return this.#readAutomation;
  }

  public get readAutomations(): ReadAutomations {
    return this.#readAutomations;
  }

  public get deleteAutomation(): DeleteAutomation {
    return this.#deleteAutomation;
  }

  public get createSubscription(): CreateSubscription {
    return this.#createSubscription;
  }

  public get updateSubscriptions(): UpdateSubscriptions{
    return this.#updateSubscriptions;
  }

  public get deleteSubscription(): DeleteSubscription {
    return this.#deleteSubscription;
  }

  public get deleteSubscriptions(): DeleteSubscriptions {
    return this.#deleteSubscriptions;
  }

  public get getAutomationAlerts(): GetAutomationAlerts {
    return this.#getAutomationAlerts;
  }

  constructor(
    createAutomation: CreateAutomation,
    updateAutomation: UpdateAutomation,
    readAutomation: ReadAutomation,
    readAutomations: ReadAutomations,
    deleteAutomation: DeleteAutomation,
    createSubscription: CreateSubscription,
    updateSubscriptions: UpdateSubscriptions,
    deleteSubscription: DeleteSubscription,
    deleteSubscriptions: DeleteSubscriptions,
    getAutomationAlerts: GetAutomationAlerts
  ) {
    this.#createAutomation = createAutomation;
    this.#updateAutomation = updateAutomation;
    this.#readAutomation = readAutomation;
    this.#readAutomations = readAutomations;
    this.#deleteAutomation = deleteAutomation;
    this.#createSubscription = createSubscription;
    this.#updateSubscriptions = updateSubscriptions;
    this.#deleteSubscription = deleteSubscription;
    this.#deleteSubscriptions = deleteSubscriptions;
    this.#getAutomationAlerts = getAutomationAlerts;
  }
}
