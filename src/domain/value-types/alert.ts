import { Result } from '../shared';

export interface AlertProps {
  selectorId: string;
  systemId: string;
}

export class Alert {
  #createdOn: number;

  #selectorId: string;

  #systemId: string;

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
    this.#createdOn = Date.now();
    this.#selectorId = props.selectorId;
    this.#systemId = props.systemId;
  }

  public static create(props: AlertProps): Result<Alert | null> {
    if (!props.selectorId)
      return Result.fail<null>('Alert must have selector id');

    const alert = new Alert(props);
    return Result.ok<Alert>(alert);
  }
}
