import { Subscription } from '../entities';

export default interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  update(subscription: Subscription): Promise<void>;
  save(subscription: Subscription): Promise<void>;
  // eslint-disable-next-line semi
}
