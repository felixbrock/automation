// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Automation, AutomationProperties } from '../entities/automation';
import { buildAutomationDto, AutomationDto } from './automation';
import { IAutomationRepository } from './i-automation-repository';
import Result from '../value-types/transient-types/result';
import { GetAccount, GetAccountResponseDto } from '../account-api/get-account';

export interface CreateAutomationRequestDto {
  name: string;
  accountId: string;
}

export type CreateAutomationResponseDto = Result<AutomationDto | null>;

export class CreateAutomation
  implements IUseCase<CreateAutomationRequestDto, CreateAutomationResponseDto>
{
  #automationRepository: IAutomationRepository;

  #getAccount: GetAccount;

  public constructor(
    automationRepository: IAutomationRepository,
    getAccount: GetAccount
  ) {
    this.#automationRepository = automationRepository;
    this.#getAccount = getAccount;
  }

  public async execute(
    request: CreateAutomationRequestDto
  ): Promise<CreateAutomationResponseDto> {
    try {
      const accountIdValid = await this.#accountIdValid(request.accountId);

      if (!accountIdValid)
        throw new Error(
          `No account for provided id ${request.accountId} found`
        );

      const automation: Result<Automation | null> =
        this.#createAutomation(request);
      if (!automation.value) return automation;

      // TODO Install error handling
      await this.#automationRepository.insertOne(automation.value);

      return Result.ok<AutomationDto>(buildAutomationDto(automation.value));
    } catch (error) {
      return Result.fail<AutomationDto>(error.message);
    }
  }

  #createAutomation = (
    request: CreateAutomationRequestDto
  ): Result<Automation | null> => {
    const automationProperties: AutomationProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      accountId: request.accountId,
    };

    return Automation.create(automationProperties);
  };

  #accountIdValid = async (accountId: string): Promise<boolean> => {
    try {      
      const getAccountResponse: GetAccountResponseDto =
        await this.#getAccount.execute({ id: accountId });
      
      if (getAccountResponse.error) return false;
      if (!getAccountResponse.value) return false;

      return true;
    } catch (error) {
      throw new Error(error);
    }
  };
}
