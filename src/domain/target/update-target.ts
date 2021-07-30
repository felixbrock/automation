import IUseCase from '../services/use-case';
import { Target} from '../value-types/target';
import { buildTargetDto, TargetDto } from './target-dto';
import { SubscriptionDto } from '../subscription/subscription-dto';
import { UpdateSubscription } from '../subscription/update-subscription';
import Result from '../value-types/transient-types/result';
import { Subscription } from '../entities/subscription';
import { ISubscriptionRepository } from '../subscription/i-subscription-repository';

export interface UpdateTargetRequestDto {
  subscriptionId: string;
  selectorId: string;
  alertsAccessedOn?: number;
  alertsAccessedOnByUser?: number;
}

export type UpdateTargetResponseDto = Result<TargetDto | null>;

export class UpdateTarget
  implements IUseCase<UpdateTargetRequestDto, UpdateTargetResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #updateSubscription: UpdateSubscription;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    updateSubscription: UpdateSubscription,
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#updateSubscription = updateSubscription;
  }

  // TODO Potential fix? Subscription is read twice. Once in update-target and once in update subscription
  public async execute(
    request: UpdateTargetRequestDto
  ): Promise<UpdateTargetResponseDto> {
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findOne(request.subscriptionId);

      if (!subscription)
        throw new Error(
          `Subscription with id ${request.subscriptionId} does not exist`
        );

      const target: Target | undefined = subscription.targets.find(
        (element) => element.selectorId === request.selectorId
      );

      if (!target)
        throw new Error(
          `Target subscribing to  ${request.selectorId} does not exist`
        );

      const modifiedTarget = this.#modifyTarget(target, request);

      const targetDtos: TargetDto[] = subscription.targets.map((element) => {
        if (element.selectorId === modifiedTarget.selectorId)
          return buildTargetDto(modifiedTarget);
        return buildTargetDto(element);
      });

      const updateSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#updateSubscription.execute({
          id: request.subscriptionId,
          targets: targetDtos,
        });

      if (updateSubscriptionResult.error)
        throw new Error(updateSubscriptionResult.error);
      if (!updateSubscriptionResult.value)
        throw new Error(
          `Couldn't update subscription ${request.subscriptionId}`
        );

      return Result.ok<TargetDto>(buildTargetDto(modifiedTarget));
    } catch (error) {
      return Result.fail<TargetDto>(error.message);
    }
  }

  #modifyTarget = (target: Target, request: UpdateTargetRequestDto): Target => {
    const targetToModify = target;

    targetToModify.alertsAccessedOn =
      request.alertsAccessedOn || target.alertsAccessedOn;
    targetToModify.alertsAccessedOnByUser =
      request.alertsAccessedOnByUser || target.alertsAccessedOnByUser;

    return targetToModify;
  };
}
