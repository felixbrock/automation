import { Subscription } from '../entities';
import Result from '../value-types/transient-types';

export interface SubscriptionQueryDto {
  automationName?: string;
  target?: TargetQueryDto;
  modifiedOn?: number;
  alertsAccessedOn?: number;
}

export interface TargetQueryDto {
  selectorId?: string;
  systemId?: string;
}

export interface ISubscriptionRepository {
  findOne(id: string): Promise<Subscription | null>;
  findBy(
    subscriptionQueryDto: SubscriptionQueryDto
  ): Promise<Subscription[]>;
  all(): Promise<Subscription[] | null>;
  update(subscription: Subscription): Promise<Result<null>>;
  save(subscription: Subscription): Promise<Result<null>>;
  delete(subscriptionId: string): Promise<Result<null>>;

  deleteTarget(
    subscriptionId: string,
    selectorId: string
  ): Promise<Result<null>>;
  // eslint-disable-next-line semi
}
