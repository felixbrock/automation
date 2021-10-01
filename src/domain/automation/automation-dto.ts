import { Automation } from "../entities/automation";
import {SubscriptionDto, buildSubscriptionDto } from "../subscription/subscription-dto";

export interface AutomationDto {
  id: string;
  name: string;
  accountId: string;
  organizationId: string;
  subscriptions: SubscriptionDto[];
  modifiedOn: number;
};

export const buildAutomationDto = (automation: Automation): AutomationDto => ({
  id: automation.id,
  name: automation.name,
  accountId: automation.accountId,
  organizationId: automation.organizationId,
  subscriptions: automation.subscriptions.map(
    (subscription): SubscriptionDto => buildSubscriptionDto(subscription)
  ),
  modifiedOn: automation.modifiedOn,
});