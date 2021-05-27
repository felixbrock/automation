import { Result } from '../value-types';

export interface SubscriptionProps {
  id: string;
  automationId: string;
  systemId: string;
  selectorId: string;
}

export interface Target {
  selectorId: string;
  systemId: string;
}

export class Subscription {
  #id: string;

  #automationId: string;

  #createdOn: number;

  #modifiedOn: number;

  #targets: Target[];


  public get id(): string {
    return this.#id;
  }

  public get automationId(): string {
    return this.#automationId;
  }

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public get targets(): Target[] {
    return this.#targets;
  }

  private constructor(props: SubscriptionProps) {
    this.#id = props.id;
    this.#automationId = props.automationId;
    this.#createdOn = Date.now();
    this.#modifiedOn = Date.now();
    this.#targets = [{selectorId: props.selectorId, systemId: props.systemId}];
  }

  public static create(props: SubscriptionProps): Result<Subscription | null> {
    if (!props.automationId) return Result.fail<null>('Subscription must have automation id');
    if (!props.selectorId) return Result.fail<null>('Subscription must have selector id');
    if (!props.systemId) return Result.fail<null>('Subscription must have system id');
    if (!props.id) return Result.fail<null>('Subscription must have id');
    // TODO move source logic to controller layer

    const subscription = new Subscription(props);
    return Result.ok<Subscription>(subscription);
  }
}
