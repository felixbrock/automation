// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface GetSystemRequestDto {
  id: string;
}

export interface GetSystemAuthDto {
  jwt: string;
}

export interface WarningDto {
  createdOn: number;
  selectorId: string;
}

export interface SystemDto {
  id: string;
  name: string;
  warnings: WarningDto[];
  modifiedOn: number;
}

export type GetSystemResponseDto = Result<SystemDto | null>;

export interface IGetSystemRepository {
  getOne(systemId: string, jwt: string): Promise<SystemDto | null>;
}

export class GetSystem
  implements
    IUseCase<GetSystemRequestDto, GetSystemResponseDto, GetSystemAuthDto>
{
  #getSystemRepository: IGetSystemRepository;

  public constructor(getSystemRepository: IGetSystemRepository) {
    this.#getSystemRepository = getSystemRepository;
  }

  public async execute(
    request: GetSystemRequestDto,
    auth: GetSystemAuthDto
  ): Promise<GetSystemResponseDto> {
    try {
      const getSystemResult: SystemDto | null =
        await this.#getSystemRepository.getOne(request.id, auth.jwt);

      if (!getSystemResult)
        throw new Error(`No system found for id ${request.id}`);

      return Result.ok<SystemDto>(getSystemResult);
    } catch (error: any) {
      return Result.fail<SystemDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
