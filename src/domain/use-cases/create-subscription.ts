// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import {IUseCase, Result} from '../shared';
import {Id} from '../object-types/value-types';
import {
  Subscription,
  SubscriptionProps,
} from '../object-types/entities';
import { CreateTargetDto } from './create-target';

export interface CreateSubscriptionRequestDto {
  automationName: string;
  systemId: string;
  selectorId: string;
}

export interface CreateSubscriptionDto {
  id: string;
  automationName: string;
  targets: CreateTargetDto[];
  modifiedOn: number;
  createdOn: number;
}

export type CreateSubscriptionResponseDto =
  Result<CreateSubscriptionDto | null>;

export interface ICreateSubscriptionRepository {
  save(subscription: Subscription): Promise<void>;
}

export class CreateSubscription
  implements
    IUseCase<CreateSubscriptionRequestDto, CreateSubscriptionResponseDto>
{
  #createSubscriptionRepository: ICreateSubscriptionRepository;

  public constructor(
    createSubscriptionRepository: ICreateSubscriptionRepository
  ) {
    this.#createSubscriptionRepository = createSubscriptionRepository;
  }

  public async execute(
    request: CreateSubscriptionRequestDto
  ): Promise<CreateSubscriptionResponseDto> {
    const subscription: Result<Subscription | null> =
      this.#createSubscription(request);
    if (!subscription.value) return subscription;

    try {
      await this.#createSubscriptionRepository.save(subscription.value);

      return Result.ok<CreateSubscriptionDto>(
        this.#buildSubscriptionDto(subscription.value)
      );
    } catch (error) {
      return Result.fail<CreateSubscriptionDto>(error.message);
    }
  }

  #buildSubscriptionDto = (
    subscription: Subscription
  ): CreateSubscriptionDto => ({
    id: subscription.id,
    automationName: subscription.automationName,
    targets: subscription.targets,
    createdOn: subscription.createdOn,
    modifiedOn: subscription.modifiedOn,
  });

  #createSubscription = (
    request: CreateSubscriptionRequestDto
  ): Result<Subscription | null> => {
    const subscriptionProps: SubscriptionProps = {
      id: Id.next(uuidv4).id,
      automationName: request.automationName,
    };

    return Subscription.create(subscriptionProps);
  };
}
