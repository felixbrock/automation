import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';
import {
  Alert,
  GetSelector,
  GetSelectorResponseDto,
} from '../selector/get-selector';
import { GetSystem, GetSystemResponseDto, Warning } from '../system/get-system';
import ISubscriptionRepository from '../subscription/i-subscription-repository';
import { Subscription } from '../entities';
import TargetDto from '../target/target-dto';
import { UpdateSubscription } from '../subscription/update-subscription';
import SubscriptionDto from '../subscription/subscription-dto';

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
    IUseCase<
      GetSubscriptionAlertsRequestDto,
      GetSubscriptionAlertsResponseDto
    >
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
        await this.#subscriptionRepository.findById(request.subscriptionId);

      if (!subscription)
        return Result.fail<GetSubscriptionAlertsDto>(
          `Subscription with id ${request.subscriptionId} does not exist.`
        );

      const getSubscriptionAlertsResponse: GetSubscriptionAlertsResponseDto =
        await this.readAlerts(
          subscription.targets,
          subscription.alertsAccessedOn
        );

      if (getSubscriptionAlertsResponse.error)
        return Result.fail<null>(getSubscriptionAlertsResponse.error);
      if (!getSubscriptionAlertsResponse.value)
        return Result.fail<null>('An error occurred while reading alerts');

      const updateSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#updateSubscription.execute({
          id: request.subscriptionId,
          alertsAccessedOn: Date.now(),
        });

      if (updateSubscriptionResult.error)
        return Result.fail<null>(updateSubscriptionResult.error);
      if (!updateSubscriptionResult.value)
        return Result.fail<null>(
          `Couldn't update subscription ${request.subscriptionId}`
        );

      return getSubscriptionAlertsResponse;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  private async readAlerts(
    targets: TargetDto[],
    alertsAccessedOn: number
  ): Promise<GetSubscriptionAlertsResponseDto> {
    const subscriptionAlerts: GetSubscriptionAlertDto[] = [];
    const subscriptionWarnings: GetSubscriptionAlertDto[] = [];

    try {
      // TODO is foreach more appropriate at this point (rather than map)?
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

          const { alerts } = getSelectorResponse.value;
          const { warnings } = getSystemResponse.value;

          const selectorContent = getSelectorResponse.value.content;
          const systemName = getSystemResponse.value.name;

          const relevantAlerts: Alert[] = alerts.filter(
            (alert) => alert.createdOn >= alertsAccessedOn
          );
          relevantAlerts.forEach((alert) => {
            const alertMessage = `An error occurred on selector ${selectorContent} in system ${systemName} at ${new Date(
              alert.createdOn
            ).toISOString()}`;

            subscriptionAlerts.push({
              message: alertMessage,
            });
          });

          if (relevantAlerts.length > 0) return;

          const relevantWarnings: Warning[] = warnings.filter(
            (warning) => warning.createdOn >= alertsAccessedOn
          );
          relevantWarnings.forEach((warning) => {
            const warningMessage = `An error occurred in system ${systemName} on a different selector at ${new Date(
              warning.createdOn
            ).toISOString()}. Be careful, this automation might be affected from system changes.`;

            subscriptionWarnings.push({
              message: warningMessage,
            });
          });
        })
      );

      return Result.ok<GetSubscriptionAlertsDto>({ alerts: subscriptionAlerts, warnings: subscriptionWarnings});
    } catch (error) {
      return Result.fail<null>(error);
    }
  }
}
