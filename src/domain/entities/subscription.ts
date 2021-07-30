import Result from '../value-types/transient-types/result';
import { Target } from '../value-types/target';

export interface SubscriptionProperties {
  id: string;
  automationName: string;
  accountId: string;
  modifiedOn?: number;
  targets?: Target[];
}

export class Subscription {
  #id: string;

  #automationName: string;

  #accountId: string;

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

  public get accountId(): string {
    return this.#accountId;
  }

  public set accountId(id: string) {
    if (!id) throw new Error('AccountId cannot be null');

    this.#accountId = id;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
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
    this.#accountId = properties.accountId;
    this.#modifiedOn = properties.modifiedOn || Date.now();
    this.#targets = properties.targets || [];
  }

  public static create(
    properties: SubscriptionProperties
  ): Result<Subscription> {
    if (!properties.automationName)
      return Result.fail<Subscription>('Subscription must have automation id');
    if (!properties.accountId)
      return Result.fail<Subscription>('Subscription must have account id');
    if (!properties.id)
      return Result.fail<Subscription>('Subscription must have id');

    const subscription = new Subscription(properties);
    return Result.ok<Subscription>(subscription);
  }

  #targetDuplicated = (targets: Target[]): boolean => {
    const selectorIds: string[] = [];
    const isDuplicatedResults = targets.map((target) => {
      if (selectorIds.includes(target.selectorId)) return true;
      selectorIds.push(target.selectorId);
      return false;
    });
    return isDuplicatedResults.includes(true);
  };
}
