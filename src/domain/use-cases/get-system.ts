import {IUseCase, Result} from '../shared';

export interface GetSystemRequestDto {
  id: string;
}

export interface GetSystemDto {
  id: string;
  name: string;
  modifiedOn: number;
  createdOn: number;
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
