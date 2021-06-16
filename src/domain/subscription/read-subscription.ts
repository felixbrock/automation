import IUseCase from '../services/use-case';
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
      const readSubscriptionResult: SubscriptionDto | null =
        await this.#subscriptionRepository.findById(
          request.id
        );
      if (!readSubscriptionResult)
        return Result.fail<null>(
          `Subscription with id ${request.id} does not exist.`
        );

      return Result.ok<SubscriptionDto>(
        readSubscriptionResult
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
