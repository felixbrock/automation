import IUseCase from '../services/use-case';
import { SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation-dto';
import { UpdateAutomation } from '../automation/update-automation';
import Result from '../value-types/transient-types/result';
import { ReadAutomation } from '../automation/read-automation';

export interface UpdateSubscriptionDto {
  selectorId: string;
  alertsAccessedOn?: number;
  alertsAccessedOnByUser?: number;
}

export interface UpdateSubscriptionsRequestDto {
  automationId: string;
  subscriptions: UpdateSubscriptionDto[];
}

export interface UpdateSubscriptionsAuthDto {
  organizationId: string;
  jwt: string;
}

export type UpdateSubscriptionsResponseDto = Result<SubscriptionDto[]>;

export class UpdateSubscriptions
  implements
    IUseCase<
      UpdateSubscriptionsRequestDto,
      UpdateSubscriptionsResponseDto,
      UpdateSubscriptionsAuthDto
    >
{
  #updateAutomation: UpdateAutomation;

  #readAutomation: ReadAutomation;

  public constructor(
    readAutomation: ReadAutomation,
    updateAutomation: UpdateAutomation
  ) {
    this.#readAutomation = readAutomation;
    this.#updateAutomation = updateAutomation;
  }

  public async execute(
    request: UpdateSubscriptionsRequestDto,
    auth: UpdateSubscriptionsAuthDto
  ): Promise<UpdateSubscriptionsResponseDto> {
    try {
      const readAutomationResult = await this.#readAutomation.execute(
        { id: request.automationId },
        { organizationId: auth.organizationId }
      );

      if (!readAutomationResult.success)
        throw new Error(readAutomationResult.error);

      const automation = readAutomationResult.value;
      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      if (automation.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const modifiedSubscriptions: SubscriptionDto[] = [];

      request.subscriptions.forEach((requestElement) => {
        const subscription: SubscriptionDto | undefined =
          automation.subscriptions.find(
            (element) => element.selectorId === requestElement.selectorId
          );

        if (!subscription)
          throw new Error(
            `Subscription to selector  ${requestElement.selectorId} does not exist for automation ${automation.id}`
          );

        modifiedSubscriptions.push(
          this.#modifySubscription(subscription, requestElement)
        );
      });

      const updateAutomationResult: Result<AutomationDto> =
        await this.#updateAutomation.execute(
          {
            id: request.automationId,
            subscriptions: modifiedSubscriptions,
          },
          { jwt: auth.jwt, organizationId: auth.organizationId }
        );

      if (!updateAutomationResult.success)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(`Couldn't update automation ${request.automationId}`);

      return Result.ok(modifiedSubscriptions);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #modifySubscription = (
    subscription: SubscriptionDto,
    request: UpdateSubscriptionDto
  ): SubscriptionDto => {
    const subscriptionToModify = subscription;

    subscriptionToModify.alertsAccessedOn =
      request.alertsAccessedOn || subscription.alertsAccessedOn;
    subscriptionToModify.alertsAccessedOnByUser =
      request.alertsAccessedOnByUser || subscription.alertsAccessedOnByUser;

    subscriptionToModify.modifiedOn = Date.now();

    return subscriptionToModify;
  };
}
