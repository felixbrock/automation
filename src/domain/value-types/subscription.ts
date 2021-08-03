import Result from "./transient-types/result";

export interface SubscriptionProperties {
  systemId: string;
  selectorId: string;
  alertsAccessedOn?: number;
  alertsAccessedOnByUser?: number;
  modifiedOn?: number;
}

export class Subscription {
  #selectorId: string;
  
  #systemId: string;

  #alertsAccessedOn: number;

  #alertsAccessedOnByUser: number;

  #modifiedOn: number;

  public get selectorId(): string {
    return this.#selectorId;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  public get alertsAccessedOn(): number {
    return this.#alertsAccessedOn;
  }

  public set alertsAccessedOn(accessedOn: number) {
    if(accessedOn < this.#alertsAccessedOn) throw new Error(
      'New alertsAccessedOn value cannot be smaller than old value'
    );

    this.#alertsAccessedOn = accessedOn;
  }

  public get alertsAccessedOnByUser(): number {
    return this.#alertsAccessedOnByUser;
  }

  public set alertsAccessedOnByUser(accessedOn: number) {
    if(accessedOn < this.#alertsAccessedOnByUser) throw new Error(
      'New alertsAccessedOnByUser value cannot be smaller than old value'
    );

    this.#alertsAccessedOnByUser = accessedOn;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: SubscriptionProperties) {
    this.#selectorId = properties.selectorId;
    this.#systemId = properties.systemId;
    this.#alertsAccessedOn = properties.alertsAccessedOn || Date.now();
    this.#alertsAccessedOnByUser = properties.alertsAccessedOnByUser || Date.now();
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  public static create(properties: SubscriptionProperties): Result<Subscription> {
    if (!properties.selectorId) return Result.fail<Subscription>('Subscription must have selector id');
    if (!properties.systemId) return Result.fail<Subscription>('Subscription must have system id');

    const subscription = new Subscription(properties);
    return Result.ok<Subscription>(subscription);
  }
}
