import {IUseCase, Result} from '../shared';
import {
  ReadSubscription,
  ReadSubscriptionRequestDto,
  ReadSubscriptionResponseDto,
} from './read-subscription';
import { ReadAlert, ReadAlertResponseDto } from './read-alert';
import { ReadSelector, ReadSelectorResponseDto } from './read-selector';
import { ReadSystem, ReadSystemResponseDto } from './read-system';
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

  #readSelector: ReadSelector;

  #readSystem: ReadSystem;

  public constructor(
    readSubscription: ReadSubscription,
    readAlert: ReadAlert,
    readSelector: ReadSelector,
    readSystem: ReadSystem
  ) {
    this.#readSubscription = readSubscription;
    this.#readAlert = readAlert;
    this.#readSelector = readSelector;
    this.#readSystem = readSystem;
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

      const readSubscriptionAlertsDto: ReadSubscriptionAlertsResponseDto =
        await this.readAlerts(subscriptionResponse.value.targets);

      if (readSubscriptionAlertsDto.error)
        return Result.fail<null>(readSubscriptionAlertsDto.error);
      if (!readSubscriptionAlertsDto.value)
        return Result.fail<null>('An error occurred while reading alerts');

      return readSubscriptionAlertsDto;
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
          const readSelectorResponseDto: ReadSelectorResponseDto =
            await this.#readSelector.execute({ id: target.selectorId });

          if (readSelectorResponseDto.error) return;
          if (!readSelectorResponseDto.value) return;

          const readSystemResponseDto: ReadSystemResponseDto =
            await this.#readSystem.execute({ id: target.systemId });

          if (readSystemResponseDto.error) return;
          if (!readSystemResponseDto.value) return;

          const alertDto: ReadAlertResponseDto = await this.#readAlert.execute({
            selectorId: target.selectorId,
            systemId: target.systemId,
          });

          if (!alertDto || !alertDto.value) return;

          if (alertDto.value.selectorId === target.selectorId) {
            const alertMessage = `An error occurred on selector ${readSelectorResponseDto.value.content} in system ${readSystemResponseDto.value.name}.`;

            const alert = alerts.find(
              (alertEntity: { message: string }) =>
                alertEntity.message === alertMessage
            );

            if (!alert)
              alerts.push({ id: alertDto.value.id, message: alertMessage });
          } else if (alertDto.value.systemId === target.systemId) {
            const warningMessage = `An error occurred in system ${readSystemResponseDto.value.name} on a selector. Your automation might be affected.`;

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
