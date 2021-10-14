import { Automation } from '../entities/automation';
import { Subscription } from '../value-types/subscription';

export interface AutomationQueryDto {
  name?: string;
  accountId?: string;
  organizationId?: string;
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
  organizationId?: string;
  subscriptions?: Subscription[];
  modifiedOn?: number
}

export interface IAutomationRepository {
  findOne(id: string): Promise<Automation | null>;
  findBy(automationQueryDto: AutomationQueryDto): Promise<Automation[]>;
  all(): Promise<Automation[]>;
  updateOne(id: string, updateDto: AutomationUpdateDto): Promise<string>;
  insertOne(automation: Automation): Promise<string>;
  deleteOne(automationId: string): Promise<string>;

  deleteSubscription(
    automationId: string,
    selectorId: string
  ): Promise<string>;
}
