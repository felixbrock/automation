import {IUseCase, Result} from '../shared';

export interface ReadSystemRequestDto {
  id: string;
}

export interface ReadSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
}

export type ReadSystemResponseDto = Result<ReadSystemDto | null>;

export interface IReadSystemRepository {
  getSystemById(systemId: string): Promise<ReadSystemDto | null>;
}

export class ReadSystem
  implements IUseCase<ReadSystemRequestDto, ReadSystemResponseDto>
{
  #readSystemRepository: IReadSystemRepository;

  public constructor(readSystemRepository: IReadSystemRepository) {
    this.#readSystemRepository = readSystemRepository;
  }

  public async execute(
    request: ReadSystemRequestDto
  ): Promise<ReadSystemResponseDto> {
    try {
      const readSystemDto: ReadSystemDto | null =
        await this.#readSystemRepository.getSystemById(request.id);

      if (!readSystemDto)
        return Result.fail<null>(
          `No system found for id ${request.id}`
        );

      return Result.ok<ReadSystemDto>(readSystemDto);
    } catch (error) {
      return Result.fail<ReadSystemDto>(error.message);
    }
  }
}
