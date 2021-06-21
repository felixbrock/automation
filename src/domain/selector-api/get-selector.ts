// TODO Should those really be use cases?
import Result from '../value-types/transient-types';
import IUseCase from '../services/use-case';

export interface GetSelectorRequestDto {
  id: string;
}

export interface Alert {
  createdOn: number;
}

export interface GetSelectorDto {
  id: string;
  content: string;
  systemId: string;
  alerts: Alert[];
  modifiedOn: number;
}

export type GetSelectorResponseDto = Result<GetSelectorDto | null>;

export interface IGetSelectorRepository {
  getById(selectorId: string): Promise<GetSelectorDto | null>;
}

export class GetSelector
  implements IUseCase<GetSelectorRequestDto, GetSelectorResponseDto>
{
  #getSelectorRepository: IGetSelectorRepository;

  public constructor(getSelectorRepository: IGetSelectorRepository) {
    this.#getSelectorRepository = getSelectorRepository;
  }

  public async execute(
    request: GetSelectorRequestDto
  ): Promise<GetSelectorResponseDto> {
    try {
      const getSelectorResponse: GetSelectorDto | null =
        await this.#getSelectorRepository.getById(
          request.id
        );

      if (!getSelectorResponse)
        throw new Error(
          `No selector found for id ${request.id}`
        );

      return Result.ok<GetSelectorDto>(getSelectorResponse);
    } catch (error) {
      return Result.fail<GetSelectorDto>(error.message);
    }
  }
}
