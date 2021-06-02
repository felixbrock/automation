import { CreateSubscription } from '../use-cases/create-subscription';
import { ReadSubscription } from '../use-cases/read-subscription';
import { ReadSubscriptionAlerts } from '../use-cases/read-subscription-alerts';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;
  
  #readSubscription: ReadSubscription;

  #readSubscriptionAlerts: ReadSubscriptionAlerts;

  public get createSubscription() : CreateSubscription {
    return this.#createSubscription;
  }

  public get readSubscription() : ReadSubscription {
    return this.#readSubscription;
  }

  public get readSubscriptionAlerts() : ReadSubscriptionAlerts {
    return this.#readSubscriptionAlerts;
  }

  constructor(createSubscription: CreateSubscription, readSubscription: ReadSubscription, readSubscriptionAlerts: ReadSubscriptionAlerts) {
    this.#createSubscription = createSubscription;
    this.#readSubscription = readSubscription;
    this.#readSubscriptionAlerts = readSubscriptionAlerts;
  }
}
