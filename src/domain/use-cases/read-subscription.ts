import {IUseCase, Result} from '../shared';
import { ReadTargetDto } from './read-target';

export interface ReadSubscriptionRequestDto {
  id: string;
}

export interface ReadSubscriptionDto {
  id: string;
  automationName: string;
  // TODO Must be read target dto
  targets: ReadTargetDto[];
  modifiedOn: number;
  createdOn: number;
}

export type ReadSubscriptionResponseDto = Result<ReadSubscriptionDto | null>;

export interface IReadSubscriptionRepository {
  findById(id: string): Promise<ReadSubscriptionDto | null>;
}

export class ReadSubscription
  implements IUseCase<ReadSubscriptionRequestDto, ReadSubscriptionResponseDto>
{
  #readSubscriptionRepository: IReadSubscriptionRepository;

  public constructor(readSubscriptionRepository: IReadSubscriptionRepository) {
    this.#readSubscriptionRepository = readSubscriptionRepository;
  }

  public async execute(
    request: ReadSubscriptionRequestDto
  ): Promise<ReadSubscriptionResponseDto> {
  
    try {
      const readSubscriptionResult: ReadSubscriptionDto | null =
        await this.#readSubscriptionRepository.findById(
          request.id
        );
      if (!readSubscriptionResult)
        return Result.fail<null>(
          `Subscription with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSubscriptionDto>(
        readSubscriptionResult
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
