// TODO Should those really be use cases?
import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';

export interface GetSystemRequestDto {
  id: string;
}

export interface Warning {
  createdOn: number;
}

export interface GetSystemDto {
  id: string;
  name: string;
  warnings: Warning[];
  modifiedOn: number;
}

export type GetSystemResponseDto = Result<GetSystemDto | null>;

export interface IGetSystemRepository {
  getById(systemId: string): Promise<GetSystemDto | null>;
}

export class GetSystem
  implements IUseCase<GetSystemRequestDto, GetSystemResponseDto>
{
  #getSystemRepository: IGetSystemRepository;

  public constructor(getSystemRepository: IGetSystemRepository) {
    this.#getSystemRepository = getSystemRepository;
  }

  public async execute(
    request: GetSystemRequestDto
  ): Promise<GetSystemResponseDto> {
    try {
      const getSystemResult: GetSystemDto | null =
        await this.#getSystemRepository.getById(request.id);

      if (!getSystemResult)
        return Result.fail<null>(
          `No system found for id ${request.id}`
        );

      return Result.ok<GetSystemDto>(getSystemResult);
    } catch (error) {
      return Result.fail<GetSystemDto>(error.message);
    }
  }
}
