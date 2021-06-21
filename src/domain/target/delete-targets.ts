import IUseCase from '../services/use-case';
import TargetDto from './target-dto';
import SubscriptionDto from '../subscription/subscription-dto';
import Result from '../value-types/transient-types';
import ISubscriptionRepository from '../subscription/i-subscription-repository';
import { ReadSubscriptions } from '../subscription/read-subscriptions';

export interface DeleteTargetsRequestDto {
  selectorId: string;
}

export type DeleteTargetsResponseDto = Result<null>;

export class DeleteTargets
  implements IUseCase<DeleteTargetsRequestDto, DeleteTargetsResponseDto>
{
  #subscriptionRepository: ISubscriptionRepository;

  #readSubscriptions: ReadSubscriptions;

  public constructor(
    subscriptionRepository: ISubscriptionRepository,
    readSubscriptions: ReadSubscriptions
  ) {
    this.#subscriptionRepository = subscriptionRepository;
    this.#readSubscriptions = readSubscriptions;
  }

  public async execute(
    request: DeleteTargetsRequestDto
  ): Promise<DeleteTargetsResponseDto> {
    try {
      // read Subscriptions
      const readSubscriptionsResult: Result<SubscriptionDto[] | null> =
        await this.#readSubscriptions.execute();

      if (readSubscriptionsResult.error)
        throw new Error(readSubscriptionsResult.error);
      if (!readSubscriptionsResult.value)
        throw new Error(`Couldn't read subscriptions`);

      const deletionResults = await Promise.all(
        readSubscriptionsResult.value.map(async (subscription) =>
          this.deleteTarget(subscription, request.selectorId)
        )
      );

      const failed = deletionResults.find((result) => result.error);
      if (failed)
        throw new Error(
          `Deletion of subscription targets referencing selector ${request.selectorId} failed. Please try again`
        );

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  private async deleteTarget(
    subscriptionDto: SubscriptionDto,
    selectorId: string
  ): Promise<Result<null>> {
    const target: TargetDto | undefined = subscriptionDto.targets.find(
      (targetElement) => targetElement.selectorId === selectorId
    );

    if (!target) return Result.ok<null>();

    return this.#subscriptionRepository.deleteTarget(
      subscriptionDto.id,
      selectorId
    );
  }
}
