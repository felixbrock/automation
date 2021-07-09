import { Subscription } from '../entities/subscription';
import Result from '../value-types/transient-types/result';

export interface SubscriptionQueryDto {
  automationName?: string;
  accountId?: string;
  target?: TargetQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface TargetQueryDto {
  selectorId?: string;
  systemId?: string;
  alertsAccessedOnStart?: number;
  alertsAccessedOnEnd?: number;
}

export interface ISubscriptionRepository {
  findOne(id: string): Promise<Subscription | null>;
  findBy(subscriptionQueryDto: SubscriptionQueryDto): Promise<Subscription[]>;
  all(): Promise<Subscription[] | null>;
  update(subscription: Subscription): Promise<Result<null>>;
  save(subscription: Subscription): Promise<Result<null>>;
  delete(subscriptionId: string): Promise<Result<null>>;

  deleteTarget(
    subscriptionId: string,
    selectorId: string
  ): Promise<Result<null>>;
}
