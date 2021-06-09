import { CreateAlert } from './use-cases/create-alert';
import { ReadAlert } from './use-cases/read-alert';

export default class AlertDomain {
  #createAlert: CreateAlert;

  #readAlert: ReadAlert;

  public get createAlert() : CreateAlert {
    return this.#createAlert;
  }

  public get readAlert() : ReadAlert {
    return this.#readAlert;
  }

  constructor(createAlert: CreateAlert, readAlert: ReadAlert) {
    this.#createAlert = createAlert;
    this.#readAlert = readAlert;
  }
}
