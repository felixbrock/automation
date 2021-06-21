import { Subscription } from '../entities';
import IUseCase from '../services/use-case';
import TargetDto from '../target/target-dto';
import { Target } from '../value-types';
import Result from '../value-types/transient-types';
import ISubscriptionRepository from './i-subscription-repository';
import SubscriptionDto from './subscription-dto';

export type ReadSubscriptionsResponseDto = Result<SubscriptionDto[] | null>;

export class ReadSubscriptions
  implements IUseCase<undefined, ReadSubscriptionsResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(): Promise<ReadSubscriptionsResponseDto> {
    try {
      const subscriptions: Subscription[] | null =
        await this.#subscriptionRepository.all();
      if (!subscriptions) throw new Error(`Subscriptions do not exist`);

      return Result.ok<SubscriptionDto[]>(
        subscriptions.map((subscription) =>
          this.#buildSubscriptionDto(subscription)
        )
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
