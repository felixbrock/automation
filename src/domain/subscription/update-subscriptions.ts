import IUseCase from '../services/use-case';
import { Subscription } from '../value-types/subscription';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation-dto';
import { UpdateAutomation } from '../automation/update-automation';
import Result from '../value-types/transient-types/result';
import { Automation } from '../entities/automation';
import { IAutomationRepository } from '../automation/i-automation-repository';

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
  #automationRepository: IAutomationRepository;

  #updateAutomation: UpdateAutomation;

  public constructor(
    automationRepository: IAutomationRepository,
    updateAutomation: UpdateAutomation
  ) {
    this.#automationRepository = automationRepository;
    this.#updateAutomation = updateAutomation;
  }

  // TODO Potential fix? Automation is read twice. Once in update-subscription and once in update automation
  public async execute(
    request: UpdateSubscriptionsRequestDto,
    auth: UpdateSubscriptionsAuthDto
  ): Promise<UpdateSubscriptionsResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.automationId);

      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      if (automation.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const modifiedSubscriptions: Subscription[] = [];

      request.subscriptions.forEach((requestElement) => {
        const subscription: Subscription | undefined =
          automation.subscriptions.find(
            (element) => element.selectorId === requestElement.selectorId
          );

        if (!subscription)
          throw new Error(
            `Subscription subscribing to  ${requestElement.selectorId} does not exist`
          );

        modifiedSubscriptions.push(
          this.#modifySubscription(subscription, requestElement)
        );
      });

      const updateAutomationResult: Result<AutomationDto | null> =
        await this.#updateAutomation.execute(
          {
            id: request.automationId,
            subscriptions: modifiedSubscriptions,
          },
          { jwt: auth.jwt, organizationId: auth.organizationId }
        );

      if (updateAutomationResult.error)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(`Couldn't update automation ${request.automationId}`);

      return Result.ok<SubscriptionDto[]>(
        modifiedSubscriptions.map((element) => buildSubscriptionDto(element))
      );
    } catch (error: any) {
      return Result.fail<SubscriptionDto[]>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #modifySubscription = (
    subscription: Subscription,
    request: UpdateSubscriptionDto
  ): Subscription => {
    const subscriptionToModify = subscription;

    subscriptionToModify.alertsAccessedOn =
      request.alertsAccessedOn || subscription.alertsAccessedOn;
    subscriptionToModify.alertsAccessedOnByUser =
      request.alertsAccessedOnByUser || subscription.alertsAccessedOnByUser;

    subscriptionToModify.modifiedOn = Date.now();

    return subscriptionToModify;
  };
}
