import IUseCase from '../services/use-case';
import { Subscription } from '../entities/subscription';
import { SubscriptionDto, buildSubscriptionDto } from './subscription-dto';
import { ISubscriptionRepository } from './i-subscription-repository';
import { Target } from '../value-types/target';
import Result from '../value-types/transient-types/result';
import { TargetDto } from '../target/target-dto';
import {
  GetSelector,
  GetSelectorResponseDto,
} from '../selector-api/get-selector';
import { GetAccount, GetAccountResponseDto } from '../account-api/get-account';

// TODO - This would be a PATCH use-case since not all fields need to be necessarily updated

export interface UpdateSubscriptionRequestDto {
  id: string;
  automationName?: string;
  accountId?: string;
  targets?: TargetDto[];
}

export type UpdateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class UpdateSubscription
  implements
    IUseCase<UpdateSubscriptionRequestDto, UpdateSubscriptionResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #getSelector: GetSelector;

  #getAccount: GetAccount;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    getSelector: GetSelector,
    getAccount: GetAccount
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#getSelector = getSelector;
    this.#getAccount = getAccount;
  }

  public async execute(
    request: UpdateSubscriptionRequestDto
  ): Promise<UpdateSubscriptionResponseDto> {
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findOne(request.id);

      if (!subscription)
        throw new Error(`Subscription with id ${request.id} does not exist`);

      if (request.targets) {
        const targetsValid = await this.#targetSelectorIdsValid(
          request.targets
        );

        if (!targetsValid)
          throw new Error(
            `One or more selectorIds and/or systemIds of the targets of subscription ${subscription.id} are invalid`
          );
      }

      if (request.accountId) {
        const accountIdValid = await this.#accountIdValid(request.accountId);

        if (!accountIdValid)
          throw new Error(
            `No account for provided id ${request.accountId} found`
          );
      }

      const modifiedSubscription = this.#modifySubscription(
        subscription,
        request
      );

      await this.#subscriptionRepository.update(modifiedSubscription);

      return Result.ok<SubscriptionDto>(
        buildSubscriptionDto(modifiedSubscription)
      );
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }

  #modifySubscription = (
    subscription: Subscription,
    request: UpdateSubscriptionRequestDto
  ): Subscription => {
    const subscriptionToModify = subscription;

    subscriptionToModify.automationName =
      request.automationName || subscription.automationName;

    subscriptionToModify.accountId =
      request.accountId || subscription.accountId;

    subscriptionToModify.targets = request.targets
      ? request.targets.map((target) => {
          const targetResult = Target.create(target);
          if (targetResult.value) return targetResult.value;
          throw new Error(
            `Creation of target ${target.selectorId} for subscription ${subscription.id} failed`
          );
        })
      : subscription.targets;

    subscriptionToModify.modifiedOn = Date.now();

    return subscriptionToModify;
  };

  #targetSelectorIdsValid = async (targets: TargetDto[]): Promise<boolean> => {
    const isValidResults: boolean[] = await Promise.all(
      targets.map(async (target) => {
        try {
          const getSelectorResponse: GetSelectorResponseDto =
            await this.#getSelector.execute({ id: target.selectorId });

          if (getSelectorResponse.error) return false;
          if (!getSelectorResponse.value) return false;
          if (target.systemId !== getSelectorResponse.value.systemId)
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
