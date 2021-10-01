// TODO Should those really be use cases?
import Result from '../value-types/transient-types/result';
import IUseCase from '../services/use-case';

export interface GetAccountRequestDto {
  id: string;
}

export interface GetAccountDto {
  id: string;
  userId: string;
  organizationId: string;
  modifiedOn: number;
}

export type GetAccountResponseDto = Result<GetAccountDto | null>;

export interface IAccountRepository {
  getOne(accountId: string): Promise<GetAccountDto | null>;
}

export class GetAccount
  implements IUseCase<GetAccountRequestDto, GetAccountResponseDto>
{
  #accountRepository: IAccountRepository;

  public constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  public async execute(
    request: GetAccountRequestDto
  ): Promise<GetAccountResponseDto> {
    try {
      const getAccountResponse: GetAccountDto | null =
        await this.#accountRepository.getOne(request.id);

      if (!getAccountResponse)
        throw new Error(`No account found for id ${request.id}`);

      return Result.ok<GetAccountDto>(getAccountResponse);
    } catch (error: any) {
      return Result.fail<GetAccountDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
