import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';
import {
  AlertDto,
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import {
  GetSystem,
  SystemDto,
  GetSystemResponseDto,
  WarningDto,
} from '../system-api/get-system';
import { ISubscriptionRepository } from './i-subscription-repository';
import { Subscription } from '../entities/subscription';
import { buildTargetDto, TargetDto } from '../target/target-dto';
import { UpdateSubscription } from './update-subscription';
import { SubscriptionDto } from './subscription-dto';
import { Target } from '../value-types/target';

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
        await this.readSubscriptionAlerts(subscription);

      if (getSubscriptionAlertsResponse.error)
        throw new Error(getSubscriptionAlertsResponse.error);
      if (!getSubscriptionAlertsResponse.value)
        throw new Error('An error occurred while reading alerts');

      return getSubscriptionAlertsResponse;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #update = async (subscription: Subscription): Promise<Result<null>> => {
    const targetDtos: TargetDto[] = subscription.targets.map((targetElement) =>
      buildTargetDto(targetElement)
    );

    const updateSubscriptionResult: Result<SubscriptionDto | null> =
      await this.#updateSubscription.execute({
        id: subscription.id,
        targets: targetDtos,
      });

    if (updateSubscriptionResult.error)
      return Result.fail(updateSubscriptionResult.error);
    if (!updateSubscriptionResult.value)
      return Result.fail(`Couldn't update subscription ${subscription.id}`);

    return Result.ok();
  };

  private async readSubscriptionAlerts(
    subscription: Subscription
  ): Promise<GetSubscriptionAlertsResponseDto> {
    try {
      const warnings: GetSubscriptionAlertDto[] = [];
      let alerts: GetSubscriptionAlertDto[] = [];

      await Promise.all(
        subscription.targets.map(async (target) => {
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

          const updateTargetResult = subscription.updateTarget(target);

          if (updateTargetResult.error) throw new Error(updateTargetResult.error);
        })
      );

      const updateSubscriptionResult = await this.#update(subscription);

      if (updateSubscriptionResult.error) throw new Error(updateSubscriptionResult.error);

      return Result.ok<GetSubscriptionAlertsDto>({
        alerts,
        warnings,
      });
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #readTargetWarnings = async (
    target: Target,
    system: SystemDto
  ): Promise<GetSubscriptionAlertDto[]> => {
    const relevantWarnings: WarningDto[] = system.warnings.filter(
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
    target: Target,
    systemName: string
  ): Promise<GetSubscriptionAlertDto[]> => {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({ id: target.selectorId });

    if (getSelectorResponse.error) return [];
    if (!getSelectorResponse.value) return [];

    const { alerts } = getSelectorResponse.value;

    const selectorContent = getSelectorResponse.value.content;

    const relevantAlerts: AlertDto[] = alerts.filter(
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
