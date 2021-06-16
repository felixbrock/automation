import Result from '../value-types/transient-types';
import { Target } from '../value-types/target';

export interface SubscriptionProperties {
  id: string;
  automationName: string;
  modifiedOn?: number;
  alertsAccessedOn?: number;
  targets?: Target[];
}

export class Subscription {
  #id: string;

  #automationName: string;

  #modifiedOn: number;

  #alertsAccessedOn: number;

  #targets: Target[];

  
  public get id(): string {
    return this.#id;
  }

  public get automationName(): string {
    return this.#automationName;
  }

  public set automationName(name: string) {
    if (!name) throw new Error('Automation name cannot be null');

    this.#automationName = name;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    if (!Subscription.timestampIsValid(modifiedOn))
      throw new Error('ModifiedOn value lies in the past');

    this.#modifiedOn = modifiedOn;
  }

  public get alertsAccessedOn(): number {
    return this.#alertsAccessedOn;
  }

  public set alertsAccessedOn(accessedOn: number) {
    if (!Subscription.timestampIsValid(accessedOn))
      throw new Error('AlertAccessedOn value lies in the past');
    this.#alertsAccessedOn = accessedOn;
  }

  public get targets(): Target[] {
    return this.#targets;
  }

  public set targets(targets: Target[]) {
    this.#targets = targets;
  }

  private constructor(properties: SubscriptionProperties) {
    this.#id = properties.id;
    this.#automationName = properties.automationName;
    this.#modifiedOn = properties.modifiedOn || Date.now();
    this.#alertsAccessedOn = properties.alertsAccessedOn || Date.now();
    this.#targets = properties.targets || [];
  }

  public static create(
    properties: SubscriptionProperties
  ): Result<Subscription> {
    if (
      properties.modifiedOn &&
      !Subscription.timestampIsValid(properties.modifiedOn)
    )
      return Result.fail<Subscription>('ModifiedOn value lies in the past');
    if (
      properties.alertsAccessedOn &&
      !Subscription.timestampIsValid(properties.alertsAccessedOn)
    )
      return Result.fail<Subscription>('AlertAccessedOn value lies in the past');
    if (!properties.automationName)
      return Result.fail<Subscription>('Subscription must have automation id');
    if (!properties.id)
      return Result.fail<Subscription>('Subscription must have id');

    const subscription = new Subscription(properties);
    return Result.ok<Subscription>(subscription);
  }

  public static timestampIsValid = (timestamp: number): boolean => {
    const minute = 60 * 1000;
    if (timestamp && timestamp < Date.now() - minute) return false;
    return true;
  };
}
