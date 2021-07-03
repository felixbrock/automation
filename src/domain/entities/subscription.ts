import Result from '../value-types/transient-types';
import { Target } from '../value-types/target';

export interface SubscriptionProperties {
  id: string;
  automationName: string;
  modifiedOn?: number;
  targets?: Target[];
}

export class Subscription {
  #id: string;

  #automationName: string;

  #modifiedOn: number;

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
    if (!Subscription.timestampValid(modifiedOn))
      throw new Error('ModifiedOn value lies in the past');

    this.#modifiedOn = modifiedOn;
  }

  public get targets(): Target[] {
    return this.#targets;
  }

  public set targets(targets: Target[]) {
    if (this.#targetDuplicated(targets))
      throw new Error(
        'Provided targets to update contain duplicates (only one targert per selector id allowed)'
      );

    this.#targets = targets;
  }

  private constructor(properties: SubscriptionProperties) {
    this.#id = properties.id;
    this.#automationName = properties.automationName;
    this.#modifiedOn = properties.modifiedOn || Date.now();
    this.#targets = properties.targets || [];
  }

  public static create(
    properties: SubscriptionProperties
  ): Result<Subscription> {
    if (
      properties.modifiedOn &&
      !Subscription.timestampValid(properties.modifiedOn)
    )
      return Result.fail<Subscription>('ModifiedOn value lies in the past');
    if (!properties.automationName)
      return Result.fail<Subscription>('Subscription must have automation id');
    if (!properties.id)
      return Result.fail<Subscription>('Subscription must have id');

    const subscription = new Subscription(properties);
    return Result.ok<Subscription>(subscription);
  }

  public static timestampValid = (timestamp: number): boolean => {
    const minute = 60 * 1000;
    if (timestamp && timestamp < Date.now() - minute) return false;
    return true;
  };

  #targetDuplicated = (targets: Target[]): boolean => {
    const selectorIds: string[] = [];
    const isDuplicatedResults = targets.map((target) => {
      if (selectorIds.includes(target.selectorId)) return true;
      selectorIds.push(target.selectorId);
      return false;
    });
    return isDuplicatedResults.includes(true);
  };

  public addTarget(target: Target): void {
    this.#targets.push(target);
  }
}
