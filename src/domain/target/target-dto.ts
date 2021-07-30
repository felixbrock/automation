import { Target } from "../value-types/target";

export interface TargetDto {
  selectorId: string;
  systemId: string;
  alertsAccessedOn: number;
  alertsAccessedOnByUser: number;
  modifiedOn: number;
};

export const buildTargetDto = (target: Target): TargetDto => ({
  selectorId: target.selectorId,
  systemId: target.systemId,
  alertsAccessedOn: target.alertsAccessedOn,
  alertsAccessedOnByUser: target.alertsAccessedOnByUser,
  modifiedOn: target.modifiedOn
});