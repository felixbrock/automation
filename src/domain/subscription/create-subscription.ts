import IUseCase from '../services/use-case';
import { Subscription, SubscriptionProperties } from '../value-types/subscription';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation';
import { UpdateAutomation } from '../automation/update-automation';
import Result from '../value-types/transient-types/result';
import { Automation } from '../entities/automation';
import { IAutomationRepository } from '../automation/i-automation-repository';

export interface CreateSubscriptionRequestDto {
  automationId: string;
  systemId: string;
  selectorId: string;
}

export type CreateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class CreateSubscription
  implements IUseCase<CreateSubscriptionRequestDto, CreateSubscriptionResponseDto>
{
  #automationRepository: IAutomationRepository;

  #updateAutomation: UpdateAutomation;

  #getSelector: GetSelector;

  public constructor(
    automationRepository: IAutomationRepository,
    updateAutomation: UpdateAutomation,
    getSelector: GetSelector
  ) {
    this.#automationRepository = automationRepository;
    this.#updateAutomation = updateAutomation;
    this.#getSelector = getSelector;
  }

  public async execute(
    request: CreateSubscriptionRequestDto
  ): Promise<CreateSubscriptionResponseDto> {
    // TODO Is this correct to also provide the automation id? Probably not.   

    const createResult: Result<Subscription | null> = this.#createSubscription(request);
    if (!createResult.value) return createResult;

    try {
      const validatedRequest = await this.validateRequest(createResult.value);
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      // TODO Potential fix? Automation is read twice. Once in create-subscription and once in update automation
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.automationId);
      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      automation.subscriptions.push(createResult.value);

      const subscriptionDtos: SubscriptionDto[] = automation.subscriptions.map(
        (subscriptionElement) => buildSubscriptionDto(subscriptionElement)
      );

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

      return Result.ok<SubscriptionDto>(buildSubscriptionDto(createResult.value));
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }

  private async validateRequest(subscription: Subscription): Promise<Result<null>> {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute({
        id: subscription.selectorId,
      });

    if (getSelectorResponse.error)
      return Result.fail<null>(getSelectorResponse.error);
    if (!getSelectorResponse.value)
      return Result.fail<null>(
        `No selector was found for id ${subscription.selectorId}`
      );

    if (getSelectorResponse.value.systemId !== subscription.systemId)
      return Result.fail<null>(
        `Provided system id ${subscription.systemId} doesn't match the selector's system ${getSelectorResponse.value.systemId}`
      );

    return Result.ok<null>(null);
  }

  #createSubscription = (request: CreateSubscriptionRequestDto): Result<Subscription | null> => {
    const subscriptionProperties: SubscriptionProperties = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Subscription.create(subscriptionProperties);
  };
}
