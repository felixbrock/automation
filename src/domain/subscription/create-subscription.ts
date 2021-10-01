import IUseCase from '../services/use-case';
import {
  Subscription,
  SubscriptionProperties,
} from '../value-types/subscription';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import { buildSubscriptionDto, SubscriptionDto } from './subscription-dto';
import { AutomationDto } from '../automation/automation-dto';
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
  implements
    IUseCase<CreateSubscriptionRequestDto, CreateSubscriptionResponseDto>
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

    const createResult: Result<Subscription | null> =
      this.#createSubscription(request);
    if (!createResult.value) return createResult;

    try {
      const validatedRequest = await this.#validateRequest(createResult.value);
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      // TODO Potential fix? Automation is read twice. Once in create-subscription and once in update automation
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.automationId);
      if (!automation)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      const existingSubscription: Subscription | undefined =
        automation.subscriptions.find(
          (subscription) => subscription.selectorId === request.selectorId
        );
      if (existingSubscription)
        throw new Error(
          `Subscription for selector ${request.selectorId} already in place for automation ${request.automationId}`
        );

      const updateAutomationResult: Result<AutomationDto | null> =
        await this.#updateAutomation.execute({
          id: request.automationId,
          subscriptions: [buildSubscriptionDto(createResult.value)],
        });

      if (updateAutomationResult.error)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(`Couldn't update automation ${request.automationId}`);

      return Result.ok<SubscriptionDto>(
        buildSubscriptionDto(createResult.value)
      );
    } catch (error: any) {
      return Result.fail<SubscriptionDto>(typeof error === 'string' ? error : error.message);
    }
  }

  #validateRequest = async (
    subscription: Subscription
  ): Promise<Result<null>> => {
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

  #createSubscription = (
    request: CreateSubscriptionRequestDto
  ): Result<Subscription | null> => {
    const subscriptionProperties: SubscriptionProperties = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Subscription.create(subscriptionProperties);
  };
}
