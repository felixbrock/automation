import { Subscription } from '../entities';
import IUseCase from '../services/use-case';
import TargetDto from '../target/target-dto';
import { Target } from '../value-types';
import Result from '../value-types/transient-types';
import {
  ISubscriptionRepository,
  SubscriptionQueryDto,
} from './i-subscription-repository';
import SubscriptionDto from './subscription-dto';

export interface ReadSubscriptionsRequestDto {
  automationName?: string;
  target?: { selectorId?: string; systemId?: string };
  modifiedOn?: number;
  alertsAccessedOn?: number;
}

export type ReadSubscriptionsResponseDto = Result<SubscriptionDto[] | null>;

export class ReadSubscriptions
  implements
    IUseCase<ReadSubscriptionsRequestDto, ReadSubscriptionsResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(
    request: ReadSubscriptionsRequestDto
  ): Promise<ReadSubscriptionsResponseDto> {
    try {
      const subscriptions: Subscription[] | null =
        await this.#subscriptionRepository.findBy(
          this.#buildSubscriptionQueryDto(request)
        );
      if (!subscriptions) throw new Error(`Queried subscriptions do not exist`);

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

  #buildSubscriptionQueryDto = (
    request: ReadSubscriptionsRequestDto
  ): SubscriptionQueryDto => ({
    automationName: request.automationName,
    target: {
      selectorId: request.target?.selectorId,
      systemId: request.target?.systemId,
    },
    modifiedOn: request.modifiedOn,
    alertsAccessedOn: request.alertsAccessedOn,
  });
}
