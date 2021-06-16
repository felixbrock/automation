import { CreateSubscription } from './subscription/create-subscription';
import { CreateTarget } from './target/create-target';
import { ReadSubscription } from './subscription/read-subscription';
import { GetSubscriptionAlerts } from './alerts/get-alerts';
import { UpdateSubscription } from './subscription/update-subscription';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;
  
  #updateSubscription: UpdateSubscription;

  #createTarget: CreateTarget;

  #readSubscription: ReadSubscription;

  #getSubscriptionAlerts: GetSubscriptionAlerts;

  public get createSubscription(): CreateSubscription {
    return this.#createSubscription;
  }

  public get updateSubscription(): UpdateSubscription {
    return this.#updateSubscription;
  }

  public get createTarget(): CreateTarget {
    return this.#createTarget;
  }

  public get readSubscription(): ReadSubscription {
    return this.#readSubscription;
  }

  public get getSubscriptionAlerts(): GetSubscriptionAlerts {
    return this.#getSubscriptionAlerts;
  }

  constructor(
    createSubscription: CreateSubscription,
    updateSubscription: UpdateSubscription,
    createTarget: CreateTarget,
    readSubscription: ReadSubscription,
    getSubscriptionAlerts: GetSubscriptionAlerts
  ) {
    this.#createSubscription = createSubscription;
    this.#updateSubscription = updateSubscription;
    this.#createTarget = createTarget;
    this.#readSubscription = readSubscription;
    this.#getSubscriptionAlerts = getSubscriptionAlerts;
  }
}
