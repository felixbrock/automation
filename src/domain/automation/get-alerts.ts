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
import { IAutomationRepository } from './i-automation-repository';
import { Automation } from '../entities/automation';
import { buildSubscriptionDto, SubscriptionDto } from '../subscription/subscription-dto';
import { UpdateAutomation } from './update-automation';
import { AutomationDto } from './automation';
import { Subscription } from '../value-types/subscription';

export interface GetAutomationAlertsRequestDto {
  automationId: string;
}

export interface GetAutomationAlertDto {
  message: string;
}

export interface GetAutomationAlertsDto {
  alerts: GetAutomationAlertDto[];
  warnings: GetAutomationAlertDto[];
}

export type GetAutomationAlertsResponseDto =
  Result<GetAutomationAlertsDto | null>;

export class GetAutomationAlerts
  implements
    IUseCase<GetAutomationAlertsRequestDto, GetAutomationAlertsResponseDto>
{
  #automationRepository: IAutomationRepository;

  #updateAutomation: UpdateAutomation;

  #getSelector: GetSelector;

  #getSystem: GetSystem;

  public constructor(
    automationRepository: IAutomationRepository,
    updateAutomation: UpdateAutomation,
    getSelector: GetSelector,
    getSystem: GetSystem
  ) {
    this.#automationRepository = automationRepository;
    this.#getSelector = getSelector;
    this.#getSystem = getSystem;
    this.#updateAutomation = updateAutomation;
  }

  public async execute(
    request: GetAutomationAlertsRequestDto
  ): Promise<GetAutomationAlertsResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.automationId);

      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      const getAutomationAlertsResponse: GetAutomationAlertsResponseDto =
        await this.readAutomationAlerts(automation);

      if (getAutomationAlertsResponse.error)
        throw new Error(getAutomationAlertsResponse.error);
      if (!getAutomationAlertsResponse.value)
        throw new Error('An error occurred while reading alerts');

      return getAutomationAlertsResponse;
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #update = async (automation: Automation): Promise<Result<null>> => {
    const subscriptionDtos: SubscriptionDto[] = automation.subscriptions.map((element) =>
      buildSubscriptionDto(element)
    );

    const updateAutomationResult: Result<AutomationDto | null> =
      await this.#updateAutomation.execute({
        id: automation.id,
        subscriptions: subscriptionDtos,
      });

    if (updateAutomationResult.error)
      return Result.fail(updateAutomationResult.error);
    if (!updateAutomationResult.value)
      return Result.fail(`Couldn't update automation ${automation.id}`);

    return Result.ok();
  };

  private async readAutomationAlerts(
    automation: Automation
  ): Promise<GetAutomationAlertsResponseDto> {
    try {
      const warnings: GetAutomationAlertDto[] = [];
      let alerts: GetAutomationAlertDto[] = [];
      const subscriptions: Subscription[] = [];

      await Promise.all(
        automation.subscriptions.map(async (subscription) => {
          const getSystemResponse: GetSystemResponseDto =
            await this.#getSystem.execute({ id: subscription.systemId });

          if (getSystemResponse.error || !getSystemResponse.value) {
            subscriptions.push(subscription);
            return;
          }

          // TODO Enable return of Warnings when covering warnings
          // warnings = await this.#readSubscriptionWarnings(subscription, getSystemResponse.value);
          alerts = await this.#readSubscriptionAlerts(
            subscription,
            getSystemResponse.value.name
          );

          const subscriptionToModify = subscription;
          subscriptionToModify.alertsAccessedOn = Date.now();
          subscriptions.push(subscriptionToModify);
        })
      );

      const automationToModify = automation;
      automationToModify.subscriptions = subscriptions;
      const updateAutomationResult = await this.#update(automation);

      if (updateAutomationResult.error)
        throw new Error(updateAutomationResult.error);

      return Result.ok<GetAutomationAlertsDto>({
        alerts,
        warnings,
      });
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #readSubscriptionWarnings = async (
    subscription: Subscription,
    system: SystemDto
  ): Promise<GetAutomationAlertDto[]> => {
    const relevantWarnings: WarningDto[] = system.warnings.filter(
      (warning) => warning.createdOn >= subscription.alertsAccessedOn
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

  #readSubscriptionAlerts = async (
    subscription: Subscription,
    systemName: string
  ): Promise<GetAutomationAlertDto[]> => {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({ id: subscription.selectorId });

    if (getSelectorResponse.error) return [];
    if (!getSelectorResponse.value) return [];

    const { alerts } = getSelectorResponse.value;

    const selectorContent = getSelectorResponse.value.content;

    const relevantAlerts: AlertDto[] = alerts.filter(
      (alert) => alert.createdOn >= subscription.alertsAccessedOn
    );

    const subscriptionAlerts = relevantAlerts.map((alert) => ({
      message: `An error occurred on selector ${selectorContent} in system ${systemName} at ${new Date(
        alert.createdOn
      ).toISOString()}`,
    }));

    return subscriptionAlerts;
  };
}
