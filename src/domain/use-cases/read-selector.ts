import IUseCase from '../shared';
import { Result } from '../entities/value-types';
import { Target } from '../entities/reference-types';

export interface ReadSelectorRequestDto {
  target: Target;
}

export type ReadSelectorResponseDto = Result<ReadSelectorDto | null>;

export interface ReadSelectorDto {
  selectorContent: string;
  systemName: string;
}

export interface IReadSelectorRepository {
  getSelectorContent(selectorId: string): Promise<string | null>;
  getSystemName(systemId: string): Promise<string | null>;
}

export class ReadSelector
  implements IUseCase<ReadSelectorRequestDto, ReadSelectorResponseDto>
{
  #readSelectorRepository: IReadSelectorRepository;

  public constructor(readSelectorRepository: IReadSelectorRepository) {
    this.#readSelectorRepository = readSelectorRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: ReadSelectorRequestDto
  ): Promise<ReadSelectorResponseDto> {
    try {
      const selectorContent: string | null =
        await this.#readSelectorRepository.getSelectorContent(
          request.target.selectorId
        );
      const systemName: string | null =
        await this.#readSelectorRepository.getSystemName(
          request.target.systemId
        );

      if (!selectorContent)
        return Result.fail<null>(
          `Content of selector ${request.target.selectorId} not found.`
        );
      if (!systemName)
        return Result.fail<null>(
          `Name of system ${request.target.systemId} not found.`
        );

      return Result.ok<ReadSelectorDto>({selectorContent, systemName});
    } catch (error) {
      return Result.fail<ReadSelectorDto>(error.message);
    }
  }
}
