import { Subscription } from "../value-types/subscription";

export interface SubscriptionDto {
  selectorId: string;
  systemId: string;
  alertsAccessedOn: number;
  alertsAccessedOnByUser: number;
  modifiedOn: number;
};

export const buildSubscriptionDto = (subscription: Subscription): SubscriptionDto => ({
  selectorId: subscription.selectorId,
  systemId: subscription.systemId,
  alertsAccessedOn: subscription.alertsAccessedOn,
  alertsAccessedOnByUser: subscription.alertsAccessedOnByUser,
  modifiedOn: subscription.modifiedOn
});