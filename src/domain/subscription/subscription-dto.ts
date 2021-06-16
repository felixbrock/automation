import TargetDto from "../target/target-dto";

export default interface SubscriptionDto {
  id: string;
  automationName: string;
  targets: TargetDto[];
  modifiedOn: number;
  alertsAccessedOn: number;
  // eslint-disable-next-line semi
}