import IUseCase from '../services/use-case';
import { Subscription} from '../value-types/subscription';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation';
import { UpdateAutomation } from '../automation/update-automation';
import Result from '../value-types/transient-types/result';
import { Automation } from '../entities/automation';
import { IAutomationRepository } from '../automation/i-automation-repository';

export interface UpdateSubscriptionRequestDto {
  automationId: string;
  selectorId: string;
  alertsAccessedOn?: number;
  alertsAccessedOnByUser?: number;
}

export type UpdateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class UpdateSubscription
  implements IUseCase<UpdateSubscriptionRequestDto, UpdateSubscriptionResponseDto>
{
  #automationRepository: IAutomationRepository;

  #updateAutomation: UpdateAutomation;

  public constructor(
    automationRepository: IAutomationRepository,
    updateAutomation: UpdateAutomation,
  ) {
    this.#automationRepository = automationRepository;
    this.#updateAutomation = updateAutomation;
  }

  // TODO Potential fix? Automation is read twice. Once in update-subscription and once in update automation
  public async execute(
    request: UpdateSubscriptionRequestDto
  ): Promise<UpdateSubscriptionResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.automationId);

      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      const subscription: Subscription | undefined = automation.subscriptions.find(
        (element) => element.selectorId === request.selectorId
      );

      if (!subscription)
        throw new Error(
          `Subscription subscribing to  ${request.selectorId} does not exist`
        );

      const modifiedSubscription = this.#modifySubscription(subscription, request);

      const subscriptionDtos: SubscriptionDto[] = automation.subscriptions.map((element) => {
        if (element.selectorId === modifiedSubscription.selectorId)
          return buildSubscriptionDto(modifiedSubscription);
        return buildSubscriptionDto(element);
      });

      const updateAutomationResult: Result<AutomationDto | null> =
        await this.#updateAutomation.execute({
          id: request.automationId,
          subscriptions: subscriptionDtos,
        });

      if (updateAutomationResult.error)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(
          `Couldn't update automation ${request.automationId}`
        );

      return Result.ok<SubscriptionDto>(buildSubscriptionDto(modifiedSubscription));
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }

  #modifySubscription = (subscription: Subscription, request: UpdateSubscriptionRequestDto): Subscription => {
    const subscriptionToModify = subscription;

    subscriptionToModify.alertsAccessedOn =
      request.alertsAccessedOn || subscription.alertsAccessedOn;
    subscriptionToModify.alertsAccessedOnByUser =
      request.alertsAccessedOnByUser || subscription.alertsAccessedOnByUser;

    subscriptionToModify.modifiedOn = Date.now();

    return subscriptionToModify;
  };
}
