import { CreateSubscription } from './subscription/create-subscription';
import { CreateTarget } from './target/create-target';
import { ReadSubscription } from './subscription/read-subscription';
import { GetSubscriptionAlerts } from './subscription/get-alerts';
import { UpdateSubscription } from './subscription/update-subscription';
import { DeleteTarget } from './target/delete-target';
import { DeleteSubscription } from './subscription/delete-subscription';
import { ReadSubscriptions } from './subscription/read-subscriptions';
import { DeleteTargets } from './target/delete-targets';
import { UpdateTarget } from './target/update-target';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;
  
  #updateSubscription: UpdateSubscription;

  #readSubscription: ReadSubscription;

  #readSubscriptions: ReadSubscriptions;

  #deleteSubscription: DeleteSubscription;

  #createTarget: CreateTarget;

  #updateTarget: UpdateTarget;

  #deleteTarget: DeleteTarget;

  #deleteTargets: DeleteTargets;

  #getSubscriptionAlerts: GetSubscriptionAlerts;

  public get createSubscription(): CreateSubscription {
    return this.#createSubscription;
  }

  public get updateSubscription(): UpdateSubscription {
    return this.#updateSubscription;
  }

  public get readSubscription(): ReadSubscription {
    return this.#readSubscription;
  }

  public get readSubscriptions(): ReadSubscriptions {
    return this.#readSubscriptions;
  }

  public get deleteSubscription(): DeleteSubscription {
    return this.#deleteSubscription;
  }

  public get createTarget(): CreateTarget {
    return this.#createTarget;
  }

  public get updateTarget(): UpdateTarget{
    return this.#updateTarget;
  }

  public get deleteTarget(): DeleteTarget {
    return this.#deleteTarget;
  }

  public get deleteTargets(): DeleteTargets {
    return this.#deleteTargets;
  }

  public get getSubscriptionAlerts(): GetSubscriptionAlerts {
    return this.#getSubscriptionAlerts;
  }

  constructor(
    createSubscription: CreateSubscription,
    updateSubscription: UpdateSubscription,
    readSubscription: ReadSubscription,
    readSubscriptions: ReadSubscriptions,
    deleteSubscription: DeleteSubscription,
    createTarget: CreateTarget,
    updateTarget: UpdateTarget,
    deleteTarget: DeleteTarget,
    deleteTargets: DeleteTargets,
    getSubscriptionAlerts: GetSubscriptionAlerts
  ) {
    this.#createSubscription = createSubscription;
    this.#updateSubscription = updateSubscription;
    this.#readSubscription = readSubscription;
    this.#readSubscriptions = readSubscriptions;
    this.#deleteSubscription = deleteSubscription;
    this.#createTarget = createTarget;
    this.#updateTarget = updateTarget;
    this.#deleteTarget = deleteTarget;
    this.#deleteTargets = deleteTargets;
    this.#getSubscriptionAlerts = getSubscriptionAlerts;
  }
}
