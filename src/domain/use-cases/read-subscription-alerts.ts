import IUseCase from '../shared';
import { Result } from '../entities/value-types';
import { Target } from '../entities/reference-types';
import {
  ReadSubscription,
  ReadSubscriptionRequestDto,
  ReadSubscriptionResponseDto,
} from './read-subscription';
import { ReadAlert, ReadAlertResponseDto } from './read-alert';
import { ReadSelector, ReadSelectorResponseDto } from './read-selector';

export interface ReadSubscriptionAlertsRequestDto {
  id: string;
}

export type ReadSubscriptionAlertsResponseDto =
  Result<ReadSubscriptionAlertsDto | null>;

export interface ReadSubscriptionAlertsDto {
  alerts: ReadSubscriptionAlertDto[];
  warnings: ReadSubscriptionAlertDto[];
}

export interface ReadSubscriptionAlertDto {
  id: string;
  message: string;
}

export class ReadSubscriptionAlerts
  implements
    IUseCase<
      ReadSubscriptionAlertsRequestDto,
      ReadSubscriptionAlertsResponseDto
    >
{
  #readSubscription: ReadSubscription;

  #readAlert: ReadAlert;

  #readSelector: ReadSelector;

  public constructor(
    readSubscription: ReadSubscription,
    readAlert: ReadAlert,
    readSelector: ReadSelector
  ) {
    this.#readSubscription = readSubscription;
    this.#readAlert = readAlert;
    this.#readSelector = readSelector;
  }

  // TODO return resolve or reject promis return instead

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

      const readSubscriptionAlertsDto: ReadSubscriptionAlertsResponseDto =
        await this.readAlerts(subscriptionResponse.value.targets);

      if (readSubscriptionAlertsDto.error) return Result.fail<null>(readSubscriptionAlertsDto.error);
      if (!readSubscriptionAlertsDto.value) return Result.fail<null>('An error occurred while generating alerts');

      return readSubscriptionAlertsDto;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  private async readAlerts(
    targets: Target[]
  ): Promise<ReadSubscriptionAlertsResponseDto> {
    const alerts: ReadSubscriptionAlertDto[] = [];
    const warnings: ReadSubscriptionAlertDto[] = [];

    try {
      await Promise.all(
        targets.map(async (target) => {
          const alertDto: ReadAlertResponseDto = await this.#readAlert.execute({
            target,
          });

          if (!alertDto || !alertDto.value) return;

          const selectorDto: ReadSelectorResponseDto =
            await this.#readSelector.execute({ target });

          if (selectorDto.error) return;
          if (!selectorDto.value) return;

          if (alertDto.value.selectorId === target.selectorId) {
            const alertMessage = `An error occurred on selector ${selectorDto.value.selectorContent} in system ${selectorDto.value.systemName}.`;

            const alert = alerts.find(
              (alertEntity: { message: string }) =>
                alertEntity.message === alertMessage
            );

            if (!alert)
              alerts.push({ id: alertDto.value.id, message: alertMessage });
          } else if (alertDto.value.systemId === target.systemId) {
            const warningMessage = `An error occurred in system ${selectorDto.value.systemName} on a selector. Your automation might be affected.`;

            const warning = warnings.find(
              (warningEntity: { message: string }) =>
                warningEntity.message === warningMessage
            );

            if (!warning)
              warnings.push({ id: alertDto.value.id, message: warningMessage });
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
