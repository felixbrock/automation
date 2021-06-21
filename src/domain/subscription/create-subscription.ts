// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../services/use-case';
import { Id, Target } from '../value-types';
import { Subscription, SubscriptionProperties } from '../entities';
import SubscriptionDto from './subscription-dto';
import ISubscriptionRepository from './i-subscription-repository';
import Result from '../value-types/transient-types';
import TargetDto from '../target/target-dto';

export interface CreateSubscriptionRequestDto {
  automationName: string;
}

export type CreateSubscriptionResponseDto = Result<SubscriptionDto | null>;

export class CreateSubscription
  implements
    IUseCase<CreateSubscriptionRequestDto, CreateSubscriptionResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  public constructor(subscriptionRepository: ISubscriptionRepository) {
    this.#subscriptionRepository = subscriptionRepository;
  }

  public async execute(
    request: CreateSubscriptionRequestDto
  ): Promise<CreateSubscriptionResponseDto> {
    const subscription: Result<Subscription | null> =
      this.#createSubscription(request);
    if (!subscription.value) return subscription;

    try {
      // TODO Install error handling
      await this.#subscriptionRepository.save(subscription.value);

      return Result.ok<SubscriptionDto>(
        this.#buildSubscriptionDto(subscription.value)
      );
    } catch (error) {
      return Result.fail<SubscriptionDto>(error.message);
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

  #createSubscription = (
    request: CreateSubscriptionRequestDto
  ): Result<Subscription | null> => {
    const subscriptionProperties: SubscriptionProperties = {
      id: Id.next(uuidv4).id,
      automationName: request.automationName,
    };

    return Subscription.create(subscriptionProperties);
  };
}
