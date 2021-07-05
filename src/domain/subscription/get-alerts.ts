import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import {
  Alert,
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import {
  GetSystem,
  GetSystemDto,
  GetSystemResponseDto,
  Warning,
} from '../system-api/get-system';
import { ISubscriptionRepository } from './i-subscription-repository';
import { Subscription } from '../entities/subscription';
import { TargetDto } from '../target/target-dto';
import { UpdateSubscription } from './update-subscription';
import { SubscriptionDto } from './subscription-dto';

export interface GetSubscriptionAlertsRequestDto {
  subscriptionId: string;
}

export interface GetSubscriptionAlertDto {
  message: string;
}

export interface GetSubscriptionAlertsDto {
  alerts: GetSubscriptionAlertDto[];
  warnings: GetSubscriptionAlertDto[];
}

export type GetSubscriptionAlertsResponseDto =
  Result<GetSubscriptionAlertsDto | null>;

export class GetSubscriptionAlerts
  implements
    IUseCase<GetSubscriptionAlertsRequestDto, GetSubscriptionAlertsResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #updateSubscription: UpdateSubscription;

  #getSelector: GetSelector;

  #getSystem: GetSystem;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    updateSubscription: UpdateSubscription,
    getSelector: GetSelector,
    getSystem: GetSystem
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#getSelector = getSelector;
    this.#getSystem = getSystem;
    this.#updateSubscription = updateSubscription;
  }

  public async execute(
    request: GetSubscriptionAlertsRequestDto
  ): Promise<GetSubscriptionAlertsResponseDto> {
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findOne(request.subscriptionId);

      if (!subscription)
        throw new Error(
          `Subscription with id ${request.subscriptionId} does not exist`
        );

      const getSubscriptionAlertsResponse: GetSubscriptionAlertsResponseDto =
        await this.readSubscriptionAlerts(subscription.targets);

      if (getSubscriptionAlertsResponse.error)
        throw new Error(getSubscriptionAlertsResponse.error);
      if (!getSubscriptionAlertsResponse.value)
        throw new Error('An error occurred while reading alerts');

      const updateSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#updateSubscription.execute({
          id: request.subscriptionId,
          alertsAccessedOn: Date.now(),
        });

      if (updateSubscriptionResult.error)
        throw new Error(updateSubscriptionResult.error);
      if (!updateSubscriptionResult.value)
        throw new Error(
          `Couldn't update subscription ${request.subscriptionId}`
        );

      return getSubscriptionAlertsResponse;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  private async readSubscriptionAlerts(
    targets: TargetDto[]
  ): Promise<GetSubscriptionAlertsResponseDto> {
    try {
      const warnings: GetSubscriptionAlertDto[] = [];
      let alerts: GetSubscriptionAlertDto[] = [];

      await Promise.all(
        targets.map(async (target) => {
          const getSystemResponse: GetSystemResponseDto =
            await this.#getSystem.execute({ id: target.systemId });

          if (getSystemResponse.error) return;
          if (!getSystemResponse.value) return;

          // TODO Enable return of Warnings when covering warnings
          // warnings = await this.#readTargetWarnings(target, getSystemResponse.value);
          alerts = await this.#readTargetAlerts(
            target,
            getSystemResponse.value.name
          );
        })
      );

      return Result.ok<GetSubscriptionAlertsDto>({
        alerts,
        warnings,
      });
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #readTargetWarnings = async (
    target: TargetDto,
    system: GetSystemDto
  ): Promise<GetSubscriptionAlertDto[]> => {
    const relevantWarnings: Warning[] = system.warnings.filter(
      (warning) => warning.createdOn >= target.alertsAccessedOn
    );

    const subscriptionWarnings = relevantWarnings.map((warning) => ({
      message: `An error occurred in system ${
        system.name
      } on a different selector at ${new Date(
        warning.createdOn
      ).toISOString()}. Be careful, this automation might be affected from system changes`,
    }));

    return subscriptionWarnings;
  };

  #readTargetAlerts = async (
    target: TargetDto,
    systemName: string
  ): Promise<GetSubscriptionAlertDto[]> => {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({ id: target.selectorId });

    if (getSelectorResponse.error) return [];
    if (!getSelectorResponse.value) return [];

    const { alerts } = getSelectorResponse.value;

    const selectorContent = getSelectorResponse.value.content;

    const relevantAlerts: Alert[] = alerts.filter(
      (alert) => alert.createdOn >= target.alertsAccessedOn
    );

    const subscriptionAlerts = relevantAlerts.map((alert) => ({
      message: `An error occurred on selector ${selectorContent} in system ${systemName} at ${new Date(
        alert.createdOn
      ).toISOString()}`,
    }));

    return subscriptionAlerts;
  };
}
