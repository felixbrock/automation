import { CreateSubscription } from './subscription/create-subscription';
import { CreateTarget } from './target/create-target';
import { ReadSubscription } from './subscription/read-subscription';
import { ReadSubscriptionAlerts } from './alerts/read-alerts';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;

  #createTarget: CreateTarget;

  #readSubscription: ReadSubscription;

  #readSubscriptionAlerts: ReadSubscriptionAlerts;

  public get createSubscription(): CreateSubscription {
    return this.#createSubscription;
  }

  public get createTarget(): CreateTarget {
    return this.#createTarget;
  }

  public get readSubscription(): ReadSubscription {
    return this.#readSubscription;
  }

  public get readSubscriptionAlerts(): ReadSubscriptionAlerts {
    return this.#readSubscriptionAlerts;
  }

  constructor(
    createSubscription: CreateSubscription,
    createTarget: CreateTarget,
    readSubscription: ReadSubscription,
    readSubscriptionAlerts: ReadSubscriptionAlerts
  ) {
    this.#createSubscription = createSubscription;
    this.#createTarget = createTarget;
    this.#readSubscription = readSubscription;
    this.#readSubscriptionAlerts = readSubscriptionAlerts;
  }
}
