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

export type CreateSubscriptionResponseDto = Result<SubscriptionDto>;

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
    try {
      const createResult: Subscription = this.#createSubscription(request);

      await this.#requestIsValid(createResult, auth.jwt);

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

      const updateAutomationResult: Result<AutomationDto> =
        await this.#updateAutomation.execute(
          {
            id: request.automationId,
            subscriptions: [buildSubscriptionDto(createResult)],
          },
          { jwt: auth.jwt, organizationId: auth.organizationId }
        );

      if (!updateAutomationResult.success)
        throw new Error(updateAutomationResult.error);
      if (!updateAutomationResult.value)
        throw new Error(`Couldn't update automation ${request.automationId}`);

      return Result.ok(buildSubscriptionDto(createResult));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #requestIsValid = async (
    subscription: Subscription,
    jwt: string
  ): Promise<boolean> => {
    const getSelectorResponse: GetSelectorResponseDto =
      await this.#getSelector.execute(
        {
          id: subscription.selectorId,
        },
        { jwt }
      );

    if (!getSelectorResponse.success)
      return Promise.reject(getSelectorResponse.error);
    if (!getSelectorResponse.value)
      return Promise.reject(
        new Error(`No selector was found for id ${subscription.selectorId}`)
      );

    if (getSelectorResponse.value.systemId !== subscription.systemId)
      return Promise.reject(
        new Error(
          `Provided system id ${subscription.systemId} doesn't match the selector's system ${getSelectorResponse.value.systemId}`
        )
      );

    return true;
  };

  #createSubscription = (
    request: CreateSubscriptionRequestDto
  ): Subscription => {
    const subscriptionProperties: SubscriptionProperties = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Subscription.create(subscriptionProperties);
  };
}
