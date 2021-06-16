// TODO Violation of Dependency Rule
import IUseCase from '../services/use-case';
import { Subscription } from '../entities';
import SubscriptionDto from './subscription-dto';
import ISubscriptionRepository from './i-subscription-repository';
import { Target } from '../value-types';
import Result from '../value-types/transient-types';
import TargetDto from '../target/target-dto';

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

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(
    request: UpdateSubscriptionRequestDto
  ): Promise<UpdateSubscriptionResponseDto> {
    if (request.targets && this.#targetDuplicated(request.targets))
      return Result.fail<SubscriptionDto>(
        'Provided targets to update contain duplicates (only one targert per selector id allowed)'
      );
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findById(request.id);

      if (!subscription)
        return Result.fail<SubscriptionDto>(
          `Subscription with id ${request.id} does not exist.`
        );

      this.#modifySubscription(subscription, request);

      await this.#subscriptionRepository.update(subscription);

      return Result.ok<SubscriptionDto>(
        this.#buildSubscriptionDto(subscription)
      );
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
    }
  }

  #targetDuplicated = (targets: TargetDto[]): boolean => {
    let duplicated = false;

    const selectorIds: string[] = [];
    targets.forEach((target) => {
      if (selectorIds.includes(target.selectorId)) {
        duplicated = true;
      }
      duplicated = false;
      selectorIds.push(target.selectorId);
    });
    return duplicated;
  };

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
          throw new Error(`Creation of subscription target ${target} failed`);
        })
      : subscription.targets;

    subscriptionToModify.alertsAccessedOn = request.alertsAccessedOn || subscription.alertsAccessedOn;

    subscriptionToModify.modifiedOn = Date.now();

    return subscriptionToModify;
  };
}
