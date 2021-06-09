import { Result } from '../../shared';

export interface TargetProps {
  subscriptionId: string;
  systemId: string;
  selectorId: string;
}

export class Target {
  #subscriptionId: string;

  #selectorId: string;
  
  #systemId: string;

  #createdOn: number;

  #modifiedOn: number;

  public get subscriptionId(): string {
    return this.#subscriptionId;
  }

  public get selectorId(): string {
    return this.#selectorId;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  private constructor(props: TargetProps) {
    this.#subscriptionId = props.subscriptionId;
    this.#selectorId = props.selectorId;
    this.#systemId = props.systemId;
    this.#createdOn = Date.now();
    this.#modifiedOn = Date.now();
  }

  public static create(props: TargetProps): Result<Target | null> {
    if (!props.subscriptionId) return Result.fail<null>('Target must have subscription id');
    if (!props.selectorId) return Result.fail<null>('Target must have selector id');
    if (!props.systemId) return Result.fail<null>('Target must have system id');

    const target = new Target(props);
    return Result.ok<Target>(target);
  }
}
