// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface GetSelectorRequestDto {
  id: string;
}

export interface GetSelectorAuthDto {
  jwt: string;
}

export interface AlertDto {
  createdOn: number;
}

export interface GetSelectorDto {
  id: string;
  content: string;
  systemId: string;
  alerts: AlertDto[];
  modifiedOn: number;
}

export type GetSelectorResponseDto = Result<GetSelectorDto | null>;

export interface IGetSelectorRepository {
  getOne(selectorId: string, jwt: string): Promise<GetSelectorDto | null>;
}

export class GetSelector
  implements
    IUseCase<GetSelectorRequestDto, GetSelectorResponseDto, GetSelectorAuthDto>
{
  #getSelectorRepository: IGetSelectorRepository;

  public constructor(getSelectorRepository: IGetSelectorRepository) {
    this.#getSelectorRepository = getSelectorRepository;
  }

  public async execute(
    request: GetSelectorRequestDto,
    auth: GetSelectorAuthDto
  ): Promise<GetSelectorResponseDto> {
    try {
      const getSelectorResponse: GetSelectorDto | null =
        await this.#getSelectorRepository.getOne(request.id, auth.jwt);

      if (!getSelectorResponse)
        throw new Error(`No selector found for id ${request.id}`);

      return Result.ok<GetSelectorDto>(getSelectorResponse);
    } catch (error: any) {
      return Result.fail<GetSelectorDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
