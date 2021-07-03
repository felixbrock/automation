import Result from "./transient-types";

export interface TargetProperties {
  systemId: string;
  selectorId: string;
  alertsAccessedOn?: number;
}

export class Target {
  #selectorId: string;
  
  #systemId: string;

  #alertsAccessedOn: number;

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
    if (!Target.timestampValid(accessedOn))
      throw new Error('AlertAccessedOn value lies in the past');
    this.#alertsAccessedOn = accessedOn;
  }

  private constructor(properties: TargetProperties) {
    this.#selectorId = properties.selectorId;
    this.#systemId = properties.systemId;
    this.#alertsAccessedOn = properties.alertsAccessedOn || Date.now();
  }

  public static create(properties: TargetProperties): Result<Target> {
    if (!properties.selectorId) return Result.fail<Target>('Target must have selector id');
    if (!properties.systemId) return Result.fail<Target>('Target must have system id');
    if (
      properties.alertsAccessedOn &&
      !Target.timestampValid(properties.alertsAccessedOn)
    )
      return Result.fail<Target>(
        'AlertAccessedOn value lies in the past'
      );

    const target = new Target(properties);
    return Result.ok<Target>(target);
  }

  public static timestampValid = (timestamp: number): boolean => {
    const minute = 60 * 1000;
    if (timestamp && timestamp < Date.now() - minute) return false;
    return true;
  };
}
