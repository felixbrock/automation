import { Automation } from '../entities/automation';
import { Subscription } from '../value-types/subscription';
import Result from '../value-types/transient-types/result';

export interface AutomationQueryDto {
  name?: string;
  accountId?: string;
  subscription?: SubscriptionQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

interface SubscriptionQueryDto {
  selectorId?: string;
  systemId?: string;
  alertsAccessedOnStart?: number;
  alertsAccessedOnEnd?: number;
  alertsAccessedOnByUserStart?: number;
  alertsAccessedOnByUserEnd?: number;
}

export interface AutomationUpdateDto{
  name?: string;
  accountId?: string;
  subscriptions?: Subscription[];
  modifiedOn?: number
}

export interface IAutomationRepository {
  findOne(id: string): Promise<Automation | null>;
  findBy(automationQueryDto: AutomationQueryDto): Promise<Automation[]>;
  all(): Promise<Automation[] | null>;
  updateOne(id: string, updateDto: AutomationUpdateDto): Promise<Result<null>>;
  insertOne(automation: Automation): Promise<Result<null>>;
  deleteOne(automationId: string): Promise<Result<null>>;

  deleteSubscription(
    automationId: string,
    selectorId: string
  ): Promise<Result<null>>;
}
