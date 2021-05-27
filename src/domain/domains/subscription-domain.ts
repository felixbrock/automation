import { CreateSubscription } from '../use-cases/create-subscription';
import { ReadSubscription } from '../use-cases/read-subscription';

export default class SubscriptionDomain {
  #createSubscription: CreateSubscription;
  
  #readSubscription: ReadSubscription;

  public get createSubscription() : CreateSubscription {
    return this.#createSubscription;
  }

  public get readSubscription() : ReadSubscription {
    return this.#readSubscription;
  }

  constructor(createSubscription: CreateSubscription, readSubscription: ReadSubscription) {
    this.#createSubscription = createSubscription;
    this.#readSubscription = readSubscription;
  }
}
