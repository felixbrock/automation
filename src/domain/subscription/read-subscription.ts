import { Subscription } from '../entities';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types';
import {ISubscriptionRepository} from './i-subscription-repository';
import {SubscriptionDto, buildSubscriptionDto } from './subscription-dto';

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
        await this.#subscriptionRepository.findOne(request.id);
      if (!subscription)
        throw new Error(
          `Subscription with id ${request.id} does not exist`
        );

      return Result.ok<SubscriptionDto>(
        buildSubscriptionDto(subscription)
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
