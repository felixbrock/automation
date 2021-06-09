import { Result } from '../../shared';
import { Target } from '../value-types/target';

export interface SubscriptionProps {
  id: string;
  automationName: string;
}

export class Subscription {
  #id: string;

  #automationName: string;

  #createdOn: number;

  #modifiedOn: number;

  #targets: Target[];


  public get id(): string {
    return this.#id;
  }

  public get automationName(): string {
    return this.#automationName;
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
    this.#automationName = props.automationName;
    this.#createdOn = Date.now();
    this.#modifiedOn = Date.now();
    this.#targets = [];
  }

  public static create(props: SubscriptionProps): Result<Subscription | null> {
    if (!props.automationName) return Result.fail<null>('Subscription must have automation id');
    if (!props.id) return Result.fail<null>('Subscription must have id');

    const subscription = new Subscription(props);
    return Result.ok<Subscription>(subscription);
  }
}
