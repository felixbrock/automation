import { Subscription } from '../entities';
import Result from '../value-types/transient-types';

export default interface ISubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  update(subscription: Subscription): Promise<Result<null>>;
  save(subscription: Subscription): Promise<Result<null>>;
  deleteTarget(subscriptionId: string, selectorId: string): Promise<Result<null>>;
  delete(subscriptionId: string): Promise<Result<null>>;
  // eslint-disable-next-line semi
}
