import { CreateSubscription } from './use-cases/create-subscription';
import { CreateTarget } from './use-cases/create-target';
import { ReadSubscription } from './use-cases/read-subscription';
import { ReadSubscriptionAlerts } from './use-cases/read-subscription-alerts';
import { ReadTarget } from './use-cases/read-target';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;

  #createTarget: CreateTarget;

  #readTarget: ReadTarget;
  
  #readSubscription: ReadSubscription;

  #readSubscriptionAlerts: ReadSubscriptionAlerts;

  public get createSubscription() : CreateSubscription {
    return this.#createSubscription;
  }

  public get createTarget() : CreateTarget {
    return this.#createTarget;
  }

  public get readTarget() : ReadTarget {
    return this.#readTarget;
  }

  public get readSubscription() : ReadSubscription {
    return this.#readSubscription;
  }

  public get readSubscriptionAlerts() : ReadSubscriptionAlerts {
    return this.#readSubscriptionAlerts;
  }

  constructor(createSubscription: CreateSubscription, createTarget: CreateTarget, readTarget: ReadTarget, readSubscription: ReadSubscription, readSubscriptionAlerts: ReadSubscriptionAlerts) {
    this.#createSubscription = createSubscription;
    this.#createTarget = createTarget;
    this.#readTarget = readTarget;
    this.#readSubscription = readSubscription;
    this.#readSubscriptionAlerts = readSubscriptionAlerts;
  }
}
