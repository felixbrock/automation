import IUseCase from '../services/use-case';
import { Subscription } from '../entities';
import SubscriptionDto from './subscription-dto';
import ISubscriptionRepository from './i-subscription-repository';
import { Target } from '../value-types';
import Result from '../value-types/transient-types';
import TargetDto from '../target/target-dto';
import { GetSelector, GetSelectorResponseDto } from '../selector/get-selector';

export interface UpdateSubscriptionRequestDto {
  id: string;
  automationName?: string;
  alertsAccessedOn?: number;
  targets?: TargetDto[];
}

export type UpdateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class UpdateSubscription
  implements
    IUseCase<UpdateSubscriptionRequestDto, UpdateSubscriptionResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #getSelector: GetSelector;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    getSelector: GetSelector
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#getSelector = getSelector;
  }

  public async execute(
    request: UpdateSubscriptionRequestDto
  ): Promise<UpdateSubscriptionResponseDto> {
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findById(request.id);

      if (!subscription)
        return Result.fail<SubscriptionDto>(
          `Subscription with id ${request.id} does not exist`
        );

      if (request.targets) {
        const targetsValid = await this.#targetSelectorIdsValid(
          request.targets
        );

        if (!targetsValid)
          return Result.fail<SubscriptionDto>(
            `One or more selectorIds and/or systemIds of the targets of subscription ${subscription.id} are invalid`
          );
      }

      const modifiedSubscription = this.#modifySubscription(
        subscription,
        request
      );

      await this.#subscriptionRepository.update(modifiedSubscription);

      return Result.ok<SubscriptionDto>(
        this.#buildSubscriptionDto(modifiedSubscription)
      );
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }

  #buildSubscriptionDto = (subscription: Subscription): SubscriptionDto => ({
    id: subscription.id,
    automationName: subscription.automationName,
    targets: subscription.targets,
    modifiedOn: subscription.modifiedOn,
    alertsAccessedOn: subscription.alertsAccessedOn,
  });

  #modifySubscription = (
    subscription: Subscription,
    request: UpdateSubscriptionRequestDto
  ): Subscription => {
    const subscriptionToModify = subscription;

    subscriptionToModify.automationName =
      request.automationName || subscription.automationName;

    subscriptionToModify.targets = request.targets
      ? request.targets.map((target) => {
          const targetResult = Target.create(target);
          if (targetResult.value) return targetResult.value;
          throw new Error(
            `Creation of target ${target.selectorId} for subscription ${subscription.id} failed`
          );
        })
      : subscription.targets;

    subscriptionToModify.alertsAccessedOn =
      request.alertsAccessedOn || subscription.alertsAccessedOn;

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
}
