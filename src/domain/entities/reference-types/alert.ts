import { Result } from '../value-types';

export interface AlertProps {
  id: string;
  selectorId: string;
  systemId: string;
}

export class Alert {
  #id: string;

  #createdOn: number;

  #selectorId: string;

  #systemId: string;

  public get id(): string {
    return this.#id;
  }

  public get createdOn(): number {
    return this.#createdOn;
  }

  public get selectorId(): string {
    return this.#selectorId;
  }

  public get systemId(): string {
    return this.#systemId;
  }

  private constructor(props: AlertProps) {
    this.#id = props.id;
    this.#createdOn = Date.now();
    this.#selectorId = props.selectorId;
    this.#systemId = props.systemId;
  }

  public static create(props: AlertProps): Result<Alert | null> {
    if (!props.selectorId)
      return Result.fail<null>('Alert must have selector id');
    if (!props.id) return Result.fail<null>('Alert must have id');
    // TODO move source logic to controller layer

    const alert = new Alert(props);
    return Result.ok<Alert>(alert);
  }
}
