import {IUseCase, Result} from '../shared';

export interface ReadAlertRequestDto {
  selectorId: string;
  systemId: string;
}

export interface ReadAlertDto {
  id: string;
  selectorId: string;
  systemId: string;
  createdOn: number;
}

export type ReadAlertResponseDto = Result<ReadAlertDto | null>;

export interface IReadAlertRepository {
  findByTarget(selectorId: string, systemId: string): Promise<ReadAlertDto | null>;
}

export class ReadAlert
  implements IUseCase<ReadAlertRequestDto, ReadAlertResponseDto>
{
  #readAlertRepository: IReadAlertRepository;

  public constructor(readAlertRepository: IReadAlertRepository) {
    this.#readAlertRepository = readAlertRepository;
  }

  public async execute(
    request: ReadAlertRequestDto
  ): Promise<ReadAlertResponseDto> {
  
    try {
      const readAlertResult: ReadAlertDto | null = await this.#readAlertRepository.findByTarget(request.selectorId, request.systemId);

      if (!readAlertResult)
        return Result.fail<null>(
          `No alerts or warnings for selector ${request.selectorId} or system ${request.systemId}.`
        );

      return Result.ok<ReadAlertDto>(
        readAlertResult
      );
    } catch (error) {
      return Result.fail<ReadAlertDto>(error.message);
    }
  }
}
