import IUseCase from '../services/use-case';
import { AutomationDto, buildAutomationDto } from './automation-dto';
import {
  AutomationUpdateDto,
  IAutomationRepository,
} from './i-automation-repository';
import { Subscription } from '../value-types/subscription';
import Result from '../value-types/transient-types/result';
import { SubscriptionDto } from '../subscription/subscription-dto';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import { Automation } from '../entities/automation';

export interface UpdateAutomationRequestDto {
  id: string;
  name?: string;
  accountId?: string;
  subscriptions?: SubscriptionDto[];
}

export interface UpdateAutomationAuthDto {
  organizationId: string;
  jwt: string;
}

export type UpdateAutomationResponseDto = Result<AutomationDto | null>;

export class UpdateAutomation
  implements
    IUseCase<
      UpdateAutomationRequestDto,
      UpdateAutomationResponseDto,
      UpdateAutomationAuthDto
    >
{
  #automationRepository: IAutomationRepository;

  #getSelector: GetSelector;

  public constructor(
    automationRepository: IAutomationRepository,
    getSelector: GetSelector
  ) {
    this.#automationRepository = automationRepository;
    this.#getSelector = getSelector;
  }

  public async execute(
    request: UpdateAutomationRequestDto,
    auth: UpdateAutomationAuthDto
  ): Promise<UpdateAutomationResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.id);

      if (!automation)
        throw new Error(`Automation with id ${request.id} does not exist`);

      if (automation.organizationId !== auth.organizationId)
        throw new Error('Not allowed to perform action');

      if (request.subscriptions) {
        const subscriptionsValid = await this.#subscriptionSelectorIdsValid(
          request.subscriptions,
          auth.jwt
        );

        if (!subscriptionsValid)
          throw new Error(
            `One or more selectorIds and/or systemIds of the subscriptions of automation ${request.id} are invalid`
          );
      }

      const updateDto = await this.#buildUpdateDto(
        request,
        auth.organizationId
      );

      const updateResult = await this.#automationRepository.updateOne(
        request.id,
        updateDto
      );

      if (updateResult.error) throw new Error(updateResult.error);

      // TODO - Doesn't return the right object. Fix.
      return Result.ok<AutomationDto>(buildAutomationDto(automation));
    } catch (error: any) {
      return Result.fail<AutomationDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #buildUpdateDto = async (
    request: UpdateAutomationRequestDto,
    organizationId: string
  ): Promise<AutomationUpdateDto> => {
    const updateDto: AutomationUpdateDto = {};

    if (request.name) updateDto.name = request.name;
    if (request.accountId) updateDto.accountId = request.accountId;
    updateDto.organizationId = organizationId;

    if (request.subscriptions && request.subscriptions.length)
      updateDto.subscriptions = request.subscriptions.map((subscription) => {
        const subscriptionResult = Subscription.create(subscription);
        if (subscriptionResult.value) return subscriptionResult.value;
        throw new Error(
          `Creation of subscription ${subscription.selectorId} for automation ${request.id} failed`
        );
      });

    updateDto.modifiedOn = Date.now();

    return updateDto;
  };

  #subscriptionSelectorIdsValid = async (
    subscriptions: SubscriptionDto[],
    jwt: string
  ): Promise<boolean> => {
    const isValidResults: boolean[] = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const getSelectorResponse: GetSelectorResponseDto =
            await this.#getSelector.execute(
              { id: subscription.selectorId },
              { jwt }
            );

          if (getSelectorResponse.error) return false;
          if (!getSelectorResponse.value) return false;
          if (subscription.systemId !== getSelectorResponse.value.systemId)
            return false;

          return true;
        } catch (error: any) {
          throw new Error(error);
        }
      })
    );

    return !isValidResults.includes(false);
  };
}
