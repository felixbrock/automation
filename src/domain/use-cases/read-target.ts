import { IUseCase, Result } from '../shared';

export interface ReadTargetRequestDto {
  subscriptionId: string;
  selectorId: string;
}

export interface ReadTargetDto {
  selectorId: string;
  systemId: string;
  createdOn: number;
}

export type ReadTargetResponseDto = Result<ReadTargetDto | null>;

export interface IReadTargetRepository {
  findBySelectorId(subscriptionId: string, selectorId: string): Promise<ReadTargetDto | null>;
}

export class ReadTarget
  implements IUseCase<ReadTargetRequestDto, ReadTargetResponseDto>
{
  #readTargetRepository: IReadTargetRepository;

  public constructor(readTargetRepository: IReadTargetRepository) {
    this.#readTargetRepository = readTargetRepository;
  }

  public async execute(
    request: ReadTargetRequestDto
  ): Promise<ReadTargetResponseDto> {
    try {
      const readTargetResult: ReadTargetDto | null =
        await this.#readTargetRepository.findBySelectorId(
          request.subscriptionId,
          request.selectorId
        );

      if (!readTargetResult)
        return Result.fail<null>(`No target found for selector id ${request.selectorId}`);

      return Result.ok<ReadTargetDto>(readTargetResult);
    } catch (error) {
      return Result.fail<ReadTargetDto>(error.message);
    }
  }
}
