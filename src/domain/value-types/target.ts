import Result from "./transient-types";

export interface TargetProperties {
  systemId: string;
  selectorId: string;
}

export class Target {
  #selectorId: string;
  
  #systemId: string;

  public get selectorId(): string {
    return this.#selectorId;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  private constructor(properties: TargetProperties) {
    this.#selectorId = properties.selectorId;
    this.#systemId = properties.systemId;
  }

  public static create(properties: TargetProperties): Result<Target> {
    if (!properties.selectorId) return Result.fail<Target>('Target must have selector id');
    if (!properties.systemId) return Result.fail<Target>('Target must have system id');

    const target = new Target(properties);
    return Result.ok<Target>(target);
  }
}
