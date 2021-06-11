import {IUseCase, Result} from '../shared';

export interface GetSelectorRequestDto {
  id: string;
}

export interface GetSelectorDto {
  id: string;
  content: string;
  systemId: string;
  modifiedOn: number;
  createdOn: number;
}

export type GetSelectorResponseDto = Result<GetSelectorDto | null>;

export interface IGetSelectorRepository {
  getSelectorById(selectorId: string): Promise<GetSelectorDto | null>;
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
        await this.#getSelectorRepository.getSelectorById(
          request.id
        );

      if (!getSelectorResponse)
        return Result.fail<null>(
          `No selector found for id ${request.id}`
        );

      return Result.ok<GetSelectorDto>(getSelectorResponse);
    } catch (error) {
      return Result.fail<GetSelectorDto>(error.message);
    }
  }
}
