import IUseCase from '../shared';
import { Result } from '../entities/value-types';
import { Target} from '../entities/reference-types';

export interface ReadAlertRequestDto {
  target: Target;
}

export type ReadAlertResponseDto = Result<ReadAlertDto | null>;

export interface ReadAlertDto {
  id: string;
  selectorId: string;
  systemId: string;
  createdOn: number;
}

export interface IReadAlertRepository {
  findByTarget(target: Target): Promise<ReadAlertDto | null>;
}

export class ReadAlert
  implements IUseCase<ReadAlertRequestDto, ReadAlertResponseDto>
{
  #readAlertRepository: IReadAlertRepository;

  public constructor(readAlertRepository: IReadAlertRepository) {
    this.#readAlertRepository = readAlertRepository;
  }

  // TODO return resolve or reject promis return instead

  public async execute(
    request: ReadAlertRequestDto
  ): Promise<ReadAlertResponseDto> {
  
    try {
      const readAlertDto: ReadAlertDto | null = await this.#readAlertRepository.findByTarget(request.target);

      if (!readAlertDto)
        return Result.fail<null>(
          `No alerts or warnings for selector ${request.target.selectorId} or system ${request.target.systemId}.`
        );

      return Result.ok<ReadAlertDto>(
        readAlertDto
      );
    } catch (error) {
      return Result.fail<ReadAlertDto>(error.message);
    }
  }
}
