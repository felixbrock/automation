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
import { ReadAutomation } from '../automation/read-automation';

export interface CreateSubscriptionRequestDto {
  automationId: string;
  systemId: string;
  selectorId: string;
}

export interface CreateSubscriptionAuthDto {
  organizationId: string;
  jwt: string;
}

export type CreateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class CreateSubscription
  implements
    IUseCase<
      CreateSubscriptionRequestDto,
      CreateSubscriptionResponseDto,
      CreateSubscriptionAuthDto
    >
{

  #updateAutomation: UpdateAutomation;

  #getSelector: GetSelector;

  #readAutomation: ReadAutomation;

  public constructor(
    updateAutomation: UpdateAutomation,
    readAutomation: ReadAutomation,
    getSelector: GetSelector
  ) {
    this.#updateAutomation = updateAutomation;
    this.#getSelector = getSelector;
    this.#readAutomation = readAutomation;
  }

  public async execute(
    request: CreateSubscriptionRequestDto,
    auth: CreateSubscriptionAuthDto
  ): Promise<CreateSubscriptionResponseDto> {
    // TODO Is this correct to also provide the automation id? Probably not.

    const createResult: Result<Subscription | null> =
      this.#createSubscription(request);
    if (!createResult.value) return createResult;

    try {
      const validatedRequest = await this.#validateRequest(
        createResult.value,
        auth.jwt
      );
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      // TODO Potential fix? Automation is read twice. Once in create-subscription and once in update automation
      const readAutomationResult = await this.#readAutomation.execute(
        { id: request.automationId },
        { organizationId: auth.organizationId }
      );

      if (!readAutomationResult.success)
        throw new Error(readAutomationResult.error);
      if (!readAutomationResult.value)
        throw new Error(
          `Automation with id ${request.automationId} does not exist`
        );

      if (readAutomationResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const existingSubscription: SubscriptionDto | undefined =
        readAutomationResult.value.subscriptions.find(
          (subscription) => subscription.selectorId === request.selectorId
        );
      if (existingSubscription)
        throw new Error(
          `Subscription for selector ${request.selectorId} already in place for automation ${request.automationId}`
        );

      const updateAutomationResult: Result<AutomationDto | null> =
        await this.#updateAutomation.execute(
          {
            id: request.automationId,
            subscriptions: [buildSubscriptionDto(createResult.value)],
          },
          { jwt: auth.jwt, organizationId: auth.organizationId }
        );

      if (updateAutomationResult.error)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(`Couldn't update automation ${request.automationId}`);

      return Result.ok<SubscriptionDto>(
        buildSubscriptionDto(createResult.value)
      );
    } catch (error: any) {
      return Result.fail<SubscriptionDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #validateRequest = async (
    subscription: Subscription,
    jwt: string
  ): Promise<Result<null>> => {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute(
        {
          id: subscription.selectorId,
        },
        { jwt }
      );

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
  };

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
