import IUseCase from '../services/use-case';
import { Target } from '../value-types';
import { ReadSubscription } from '../subscription/read-subscription';
import TargetDto from './target-dto';
import SubscriptionDto from '../subscription/subscription-dto';
import Result from '../value-types/transient-types';
import ISubscriptionRepository from '../subscription/i-subscription-repository';

export interface DeleteTargetRequestDto {
  subscriptionId: string;
  selectorId: string;
}

export type DeleteTargetResponseDto = Result<null>;

export class DeleteTarget
  implements IUseCase<DeleteTargetRequestDto, DeleteTargetResponseDto>
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
    request: DeleteTargetRequestDto
  ): Promise<DeleteTargetResponseDto> {
    try {
      const readSubscriptionResult: Result<SubscriptionDto | null> =
        await this.#readSubscription.execute({ id: request.subscriptionId });

      if (readSubscriptionResult.error)
        throw new Error(readSubscriptionResult.error);
      if (!readSubscriptionResult.value)
        throw new Error(`Couldn't read subscription ${request.subscriptionId}`);

      const deleteTargetResult: Result<null> =
        await this.#subscriptionRepository.deleteTarget(
          request.subscriptionId,
          request.selectorId
        );

      if (deleteTargetResult.error) throw new Error(deleteTargetResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildTargetDto = (target: Target): TargetDto => ({
    selectorId: target.selectorId,
    systemId: target.systemId,
  });
}
