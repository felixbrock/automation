import IUseCase from '../shared';
import { Result } from '../entities/value-types';
import { Target} from '../entities/reference-types';

export interface ReadSubscriptionRequestDto {
  id: string;
}

export type ReadSubscriptionResponseDto = Result<ReadSubscriptionDto | null>;

export interface ReadSubscriptionDto {
  id: string;
  automationId: string;
  targets: Target[];
  modifiedOn: number;
  createdOn: number;
}

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

  // TODO return resolve or reject promis return instead

  public async execute(
    request: ReadSubscriptionRequestDto
  ): Promise<ReadSubscriptionResponseDto> {
  
    try {
      const readSubscriptionDto: ReadSubscriptionDto | null =
        await this.#readSubscriptionRepository.findById(
          request.id
        );
      if (!readSubscriptionDto)
        return Result.fail<null>(
          `Subscription with id ${request.id} does not exist.`
        );

      return Result.ok<ReadSubscriptionDto>(
        readSubscriptionDto
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
