import { Subscription } from '../entities';
import IUseCase from '../services/use-case';
import TargetDto from '../target/target-dto';
import { Target } from '../value-types';
import Result from '../value-types/transient-types';
import ISubscriptionRepository from './i-subscription-repository';
import SubscriptionDto from './subscription-dto';

export interface ReadSubscriptionRequestDto {
  id: string;
}

export type ReadSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class ReadSubscription
  implements IUseCase<ReadSubscriptionRequestDto, ReadSubscriptionResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(
    request: ReadSubscriptionRequestDto
  ): Promise<ReadSubscriptionResponseDto> {
    try {
      const subscription: Subscription | null =
        await this.#subscriptionRepository.findById(request.id);
      if (!subscription)
        throw new Error(
          `Subscription with id ${request.id} does not exist`
        );

      return Result.ok<SubscriptionDto>(
        this.#buildSubscriptionDto(subscription)
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildSubscriptionDto = (subscription: Subscription): SubscriptionDto => ({
    id: subscription.id,
    automationName: subscription.automationName,
    targets: subscription.targets.map(
      (target): TargetDto => this.#buildTargetDto(target)
    ),
    modifiedOn: subscription.modifiedOn,
    alertsAccessedOn: subscription.alertsAccessedOn,
  });

  #buildTargetDto = (target: Target): TargetDto => ({
    selectorId: target.selectorId,
    systemId: target.systemId,
  });
}
