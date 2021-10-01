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
import { GetAccount, GetAccountResponseDto } from '../account-api/get-account';
import { Automation } from '../entities/automation';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated

export interface UpdateAutomationRequestDto {
  id: string;
  name?: string;
  accountId?: string;
  organizationId?: string;
  subscriptions?: SubscriptionDto[];
}

export type UpdateAutomationResponseDto = Result<AutomationDto | null>;

export class UpdateAutomation
  implements IUseCase<UpdateAutomationRequestDto, UpdateAutomationResponseDto>
{
  #automationRepository: IAutomationRepository;

  #getSelector: GetSelector;

  #getAccount: GetAccount;

  public constructor(
    automationRepository: IAutomationRepository,
    getSelector: GetSelector,
    getAccount: GetAccount
  ) {
    this.#automationRepository = automationRepository;
    this.#getSelector = getSelector;
    this.#getAccount = getAccount;
  }

  public async execute(
    request: UpdateAutomationRequestDto
  ): Promise<UpdateAutomationResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.id);

      if (!automation)
        throw new Error(`Automation with id ${request.id} does not exist`);

      if (request.subscriptions) {
        const subscriptionsValid = await this.#subscriptionSelectorIdsValid(
          request.subscriptions
        );

        if (!subscriptionsValid)
          throw new Error(
            `One or more selectorIds and/or systemIds of the subscriptions of automation ${request.id} are invalid`
          );
      }

      if (request.organizationId && !request.accountId)
        throw new Error(
          `In order to update an automation's organization please also provide the user's account id`
        );

      if (request.accountId) {
        const getAccountResponse: GetAccountResponseDto =
          await this.#getAccount.execute({ id: request.accountId });

        if (!getAccountResponse.value)
          throw new Error(
            `No account for provided id ${request.accountId} found`
          );

        if (
          request.organizationId &&
          request.organizationId !== getAccountResponse.value.organizationId
        )
          throw new Error(
            `Automation ${request.id} to update doesn't match the user's organization`
          );
      }

      const updateDto = await this.#buildUpdateDto(request);

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
    request: UpdateAutomationRequestDto
  ): Promise<AutomationUpdateDto> => {
    const updateDto: AutomationUpdateDto = {};

    if (request.name) updateDto.name = request.name;
    if (request.accountId) updateDto.accountId = request.accountId;
    if (request.organizationId) updateDto.organizationId = request.organizationId;

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
    subscriptions: SubscriptionDto[]
  ): Promise<boolean> => {
    const isValidResults: boolean[] = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const getSelectorResponse: GetSelectorResponseDto =
            await this.#getSelector.execute({ id: subscription.selectorId });

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
