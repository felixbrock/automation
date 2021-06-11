import {IUseCase, Result} from '../shared';

export interface ReadSelectorRequestDto {
  id: string;
}

export interface ReadSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export type ReadSelectorResponseDto = Result<ReadSelectorDto | null>;

export interface IReadSelectorRepository {
  getSelectorById(selectorId: string): Promise<ReadSelectorDto | null>;
}

export class ReadSelector
  implements IUseCase<ReadSelectorRequestDto, ReadSelectorResponseDto>
{
  #readSelectorRepository: IReadSelectorRepository;

  public constructor(readSelectorRepository: IReadSelectorRepository) {
    this.#readSelectorRepository = readSelectorRepository;
  }

  public async execute(
    request: ReadSelectorRequestDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const readSelectorResponse: ReadSelectorDto | null =
        await this.#readSelectorRepository.getSelectorById(
          request.id
        );

      if (!readSelectorResponse)
        return Result.fail<null>(
          `No selector found for id ${request.id}`
        );

      return Result.ok<ReadSelectorDto>(readSelectorResponse);
    } catch (error) {
      return Result.fail<ReadSelectorDto>(error.message);
    }
  }
}
