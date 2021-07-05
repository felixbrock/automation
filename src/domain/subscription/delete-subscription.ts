import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { ISubscriptionRepository } from './i-subscription-repository';
import { ReadSubscription } from './read-subscription';
import { SubscriptionDto } from './subscription-dto';

export interface DeleteSubscriptionRequestDto {
  subscriptionId: string;
}

export type DeleteSubscriptionResponseDto = Result<null>;

export class DeleteSubscription
  implements
    IUseCase<DeleteSubscriptionRequestDto, DeleteSubscriptionResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #readSubscription: ReadSubscription;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    readSubscription: ReadSubscription
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#readSubscription = readSubscription;
  }

  public async execute(
    request: DeleteSubscriptionRequestDto
  ): Promise<DeleteSubscriptionResponseDto> {
    try {
      const readSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#readSubscription.execute({ id: request.subscriptionId });

      if (readSubscriptionResult.error)
        throw new Error(readSubscriptionResult.error);
      if (!readSubscriptionResult.value)
        throw new Error(`Couldn't read subscription ${request.subscriptionId}`);

      const deleteSubscriptionResult: Result<null> =
        await this.#subscriptionRepository.delete(request.subscriptionId);

      if (deleteSubscriptionResult.error)
        throw new Error(deleteSubscriptionResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
