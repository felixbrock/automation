import { CreateSubscription } from './subscription/create-subscription';
import { CreateTarget } from './target/create-target';
import { ReadSubscription } from './subscription/read-subscription';
import { GetSubscriptionAlerts } from './get-alerts/get-alerts';
import { UpdateSubscription } from './subscription/update-subscription';
import { DeleteTarget } from './target/delete-target';
import { DeleteSubscription } from './subscription/delete-subscription';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;
  
  #updateSubscription: UpdateSubscription;

  #readSubscription: ReadSubscription;

  #deleteSubscription: DeleteSubscription;

  #createTarget: CreateTarget;

  #deleteTarget: DeleteTarget;

  #getSubscriptionAlerts: GetSubscriptionAlerts;

  public get createSubscription(): CreateSubscription {
    return this.#createSubscription;
  }

  public get updateSubscription(): UpdateSubscription {
    return this.#updateSubscription;
  }

  public get deleteSubscription(): DeleteSubscription {
    return this.#deleteSubscription;
  }

  public get createTarget(): CreateTarget {
    return this.#createTarget;
  }

  public get deleteTarget(): DeleteTarget {
    return this.#deleteTarget;
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
    readSubscription: ReadSubscription,
    deleteSubscription: DeleteSubscription,
    createTarget: CreateTarget,
    deleteTarget: DeleteTarget,
    getSubscriptionAlerts: GetSubscriptionAlerts
  ) {
    this.#createSubscription = createSubscription;
    this.#updateSubscription = updateSubscription;
    this.#readSubscription = readSubscription;
    this.#deleteSubscription = deleteSubscription;
    this.#createTarget = createTarget;
    this.#deleteTarget = deleteTarget;
    this.#getSubscriptionAlerts = getSubscriptionAlerts;
  }
}
