import Result from "./transient-types/result";

export interface TargetProperties {
  systemId: string;
  selectorId: string;
  alertsAccessedOn?: number;
  alertsAccessedOnByUser?: number;
  modifiedOn?: number;
}

export class Target {
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
    this.#alertsAccessedOn = accessedOn;
  }

  public get alertsAccessedOnByUser(): number {
    return this.#alertsAccessedOnByUser;
  }

  public set alertsAccessedOnByUser(accessedOn: number) {
    this.#alertsAccessedOnByUser = accessedOn;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: TargetProperties) {
    this.#selectorId = properties.selectorId;
    this.#systemId = properties.systemId;
    this.#alertsAccessedOn = properties.alertsAccessedOn || Date.now();
    this.#alertsAccessedOnByUser = properties.alertsAccessedOnByUser || Date.now();
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  public static create(properties: TargetProperties): Result<Target> {
    if (!properties.selectorId) return Result.fail<Target>('Target must have selector id');
    if (!properties.systemId) return Result.fail<Target>('Target must have system id');

    const target = new Target(properties);
    return Result.ok<Target>(target);
  }
}
