import Result from '../value-types/transient-types/result';
import { Subscription } from '../value-types/subscription';

export interface AutomationProperties {
  id: string;
  name: string;
  accountId: string;
  organizationId: string;
  modifiedOn?: number;
  subscriptions?: Subscription[];
}

export class Automation {
  #id: string;

  #name: string;

  #accountId: string;

  #organizationId: string;

  #modifiedOn: number;

  #subscriptions: Subscription[];

  public get id(): string {
    return this.#id;
  }

  public get name(): string {
    return this.#name;
  }

  public set name(name: string) {
    if (!name) throw new Error('Automation must have name');

    this.#name = name;
  }

  public get accountId(): string {
    return this.#accountId;
  }

  public set accountId(id: string) {
    if (!id) throw new Error('Automation must have accountId');

    this.#accountId = id;
  }

  public get organizationId(): string {
    return this.#organizationId;
  }

  public set organizationId(id: string) {
    if (!id) throw new Error('Automation must have organizationId');

    this.#organizationId = id;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  public get subscriptions(): Subscription[] {
    return this.#subscriptions;
  }

  public set subscriptions(subscriptions: Subscription[]) {
    if (this.#subscriptionDuplicated(subscriptions))
      throw new Error(
        'Provided subscriptions to update contain duplicates (only one targert per selector id allowed)'
      );

    this.#subscriptions = subscriptions;
  }

  private constructor(properties: AutomationProperties) {
    this.#id = properties.id;
    this.#name = properties.name;
    this.#accountId = properties.accountId;
    this.#organizationId = properties.organizationId;
    this.#modifiedOn = properties.modifiedOn || Date.now();
    this.#subscriptions = properties.subscriptions || [];
  }

  public static create(
    properties: AutomationProperties
  ): Result<Automation> {
    if (!properties.name)
      return Result.fail('Automation must have automation id');
    if (!properties.accountId)
      return Result.fail('Automation must have account id');
    if(!properties.organizationId)
    return Result.fail('Automation must have organization id');
    if (!properties.id)
      return Result.fail('Automation must have id');

    const automation = new Automation(properties);
    return Result.ok(automation);
  }

  #subscriptionDuplicated = (subscriptions: Subscription[]): boolean => {
    const selectorIds: string[] = [];
    const isDuplicatedResults = subscriptions.map((subscription) => {
      if (selectorIds.includes(subscription.selectorId)) return true;
      selectorIds.push(subscription.selectorId);
      return false;
    });
    return isDuplicatedResults.includes(true);
  };
}
