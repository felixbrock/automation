import { Subscription } from "../entities/subscription";
import {TargetDto, buildTargetDto } from "../target/target-dto";

export interface SubscriptionDto {
  id: string;
  automationName: string;
  targets: TargetDto[];
  modifiedOn: number;
};

export const buildSubscriptionDto = (subscription: Subscription): SubscriptionDto => ({
  id: subscription.id,
  automationName: subscription.automationName,
  targets: subscription.targets.map(
    (target): TargetDto => buildTargetDto(target)
  ),
  modifiedOn: subscription.modifiedOn,
});