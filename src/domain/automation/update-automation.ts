import IUseCase from '../services/use-case';
import { Automation } from '../entities/automation';
import { AutomationDto, buildAutomationDto } from './automation';
import { IAutomationRepository } from './i-automation-repository';
import { Subscription } from '../value-types/subscription';
import Result from '../value-types/transient-types/result';
import { SubscriptionDto } from '../subscription/subscription-dto';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import { GetAccount, GetAccountResponseDto } from '../account-api/get-account';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated

export interface UpdateAutomationRequestDto {
  id: string;
  automationName?: string;
  accountId?: string;
  subscriptions?: SubscriptionDto[];
}

export type UpdateAutomationResponseDto = Result<AutomationDto | null>;

export class UpdateAutomation
  implements
    IUseCase<UpdateAutomationRequestDto, UpdateAutomationResponseDto>
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
            `One or more selectorIds and/or systemIds of the subscriptions of automation ${automation.id} are invalid`
          );
      }

      if (request.accountId) {
        const accountIdValid = await this.#accountIdValid(request.accountId);

        if (!accountIdValid)
          throw new Error(
            `No account for provided id ${request.accountId} found`
          );
      }

      const modifiedAutomation = this.#modifyAutomation(
        automation,
        request
      );

      await this.#automationRepository.update(modifiedAutomation);

      return Result.ok<AutomationDto>(
        buildAutomationDto(modifiedAutomation)
      );
    } catch (error) {
      return Result.fail<AutomationDto>(error.message);
    }
  }

  #modifyAutomation = (
    automation: Automation,
    request: UpdateAutomationRequestDto
  ): Automation => {
    const automationToModify = automation;

    automationToModify.automationName =
      request.automationName || automation.automationName;

    automationToModify.accountId =
      request.accountId || automation.accountId;

    automationToModify.subscriptions = request.subscriptions
      ? request.subscriptions.map((subscription) => {
          const subscriptionResult = Subscription.create(subscription);
          if (subscriptionResult.value) return subscriptionResult.value;
          throw new Error(
            `Creation of subscription ${subscription.selectorId} for automation ${automation.id} failed`
          );
        })
      : automation.subscriptions;

    automationToModify.modifiedOn = Date.now();

    return automationToModify;
  };

  #subscriptionSelectorIdsValid = async (subscriptions: SubscriptionDto[]): Promise<boolean> => {
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
        } catch (error) {
          throw new Error(error);
        }
      })
    );

    return !isValidResults.includes(false);
  };

  #accountIdValid = async (accountId: string): Promise<boolean> => {
    try {
      const getAccountResponse: GetAccountResponseDto =
        await this.#getAccount.execute({ id: accountId });

      if (getAccountResponse.error) return false;
      if (!getAccountResponse.value) return false;

      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
}
