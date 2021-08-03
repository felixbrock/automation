import { Automation } from '../entities/automation';
import Result from '../value-types/transient-types/result';

export interface AutomationQueryDto {
  automationName?: string;
  accountId?: string;
  subscription?: SubscriptionQueryDto;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface SubscriptionQueryDto {
  selectorId?: string;
  systemId?: string;
  alertsAccessedOnStart?: number;
  alertsAccessedOnEnd?: number;
  alertsAccessedOnByUserStart?: number;
  alertsAccessedOnByUserEnd?: number;
}

export interface IAutomationRepository {
  findOne(id: string): Promise<Automation | null>;
  findBy(automationQueryDto: AutomationQueryDto): Promise<Automation[]>;
  all(): Promise<Automation[] | null>;
  update(automation: Automation): Promise<Result<null>>;
  save(automation: Automation): Promise<Result<null>>;
  delete(automationId: string): Promise<Result<null>>;

  deleteSubscription(
    automationId: string,
    selectorId: string
  ): Promise<Result<null>>;
}
