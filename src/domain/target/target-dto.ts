import { Target } from "../value-types";

export interface TargetDto {
  selectorId: string;
  systemId: string;
  alertsAccessedOn: number;
};

export const buildTargetDto = (target: Target): TargetDto => ({
  selectorId: target.selectorId,
  systemId: target.systemId,
  alertsAccessedOn: target.alertsAccessedOn
});