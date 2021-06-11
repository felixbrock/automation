import {IUseCase, Result} from '../shared';
import {
  ReadSubscription,
  ReadSubscriptionRequestDto,
  ReadSubscriptionResponseDto,
} from './read-subscription';
import { ReadAlert, ReadAlertResponseDto } from './read-alert';
import { GetSelector, GetSelectorResponseDto } from './get-selector';
import { GetSystem, GetSystemResponseDto } from './get-system';
import { ReadTargetDto } from './read-target';

export interface ReadSubscriptionAlertsRequestDto {
  id: string;
}

export interface ReadSubscriptionAlertDto {
  id: string;
  message: string;
}

export interface ReadSubscriptionAlertsDto {
  alerts: ReadSubscriptionAlertDto[];
  warnings: ReadSubscriptionAlertDto[];
}

export type ReadSubscriptionAlertsResponseDto =
  Result<ReadSubscriptionAlertsDto | null>;

export class ReadSubscriptionAlerts
  implements
    IUseCase<
      ReadSubscriptionAlertsRequestDto,
      ReadSubscriptionAlertsResponseDto
    >
{
  #readSubscription: ReadSubscription;

  #readAlert: ReadAlert;

  #getSelector: GetSelector;

  #getSystem: GetSystem;

  public constructor(
    readSubscription: ReadSubscription,
    readAlert: ReadAlert,
    getSelector: GetSelector,
    getSystem: GetSystem
  ) {
    this.#readSubscription = readSubscription;
    this.#readAlert = readAlert;
    this.#getSelector = getSelector;
    this.#getSystem = getSystem;
  }

  public async execute(
    request: ReadSubscriptionAlertsRequestDto
  ): Promise<ReadSubscriptionAlertsResponseDto> {
    try {
      const subscriptionResponse: ReadSubscriptionResponseDto =
        await this.readSubscription(request);

      if (subscriptionResponse.error)
        return Result.fail<null>(subscriptionResponse.error);
      if (!subscriptionResponse.value)
        return Result.fail<null>(
          `No subscription was returned for subscription id ${request.id}`
        );

      const readSubscriptionAlertsResponse: ReadSubscriptionAlertsResponseDto =
        await this.readAlerts(subscriptionResponse.value.targets);

      if (readSubscriptionAlertsResponse.error)
        return Result.fail<null>(readSubscriptionAlertsResponse.error);
      if (!readSubscriptionAlertsResponse.value)
        return Result.fail<null>('An error occurred while reading alerts');

      return readSubscriptionAlertsResponse;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  // TODO CreatTargetDto usage doesn't make sense at this point. A agnostic TargetDto would probably make more sense
  private async readAlerts(
    targets: ReadTargetDto[]
  ): Promise<ReadSubscriptionAlertsResponseDto> {
    const alerts: ReadSubscriptionAlertDto[] = [];
    const warnings: ReadSubscriptionAlertDto[] = [];

    try {
      await Promise.all(
        targets.map(async (target) => {
          const getSelectorResponse: GetSelectorResponseDto =
            await this.#getSelector.execute({ id: target.selectorId });

          if (getSelectorResponse.error) return;
          if (!getSelectorResponse.value) return;

          const getSystemResponse: GetSystemResponseDto =
            await this.#getSystem.execute({ id: target.systemId });

          if (getSystemResponse.error) return;
          if (!getSystemResponse.value) return;

          const readAlertResponse: ReadAlertResponseDto = await this.#readAlert.execute({
            selectorId: target.selectorId,
            systemId: target.systemId,
          });

          if (!readAlertResponse || !readAlertResponse.value) return;

          if (readAlertResponse.value.selectorId === target.selectorId) {
            const alertMessage = `An error occurred on selector ${getSelectorResponse.value.content} in system ${getSystemResponse.value.name}.`;

            const alert = alerts.find(
              (alertEntity: { message: string }) =>
                alertEntity.message === alertMessage
            );

            if (!alert)
              alerts.push({ id: readAlertResponse.value.id, message: alertMessage });
          } else if (readAlertResponse.value.systemId === target.systemId) {
            const warningMessage = `An error occurred in system ${getSystemResponse.value.name} on a selector. Your automation might be affected.`;

            const warning = warnings.find(
              (warningEntity: { message: string }) =>
                warningEntity.message === warningMessage
            );

            if (!warning)
              warnings.push({ id: readAlertResponse.value.id, message: warningMessage });
          }
        })
      );

      return Result.ok<ReadSubscriptionAlertsDto>({ alerts, warnings });
    } catch (error) {
      return Result.fail<null>(error);
    }
  }

  private async readSubscription(
    request: ReadSubscriptionRequestDto
  ): Promise<ReadSubscriptionResponseDto> {
    try {
      return await this.#readSubscription.execute(request);
    } catch (error) {
      return Result.fail<null>(error);
    }
  }
}
