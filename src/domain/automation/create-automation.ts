// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Automation, AutomationProperties } from '../entities/automation';
import { buildAutomationDto, AutomationDto } from './automation-dto';
import { IAutomationRepository } from './i-automation-repository';
import Result from '../value-types/transient-types/result';

export interface CreateAutomationRequestDto {
  name: string;
}

export interface CreateAutomationAuthDto {
  accountId: string;
  organizationId: string;
}

export type CreateAutomationResponseDto = Result<AutomationDto | null>;

export class CreateAutomation
  implements
    IUseCase<
      CreateAutomationRequestDto,
      CreateAutomationResponseDto,
      CreateAutomationAuthDto
    >
{
  #automationRepository: IAutomationRepository;


  public constructor(
    automationRepository: IAutomationRepository,
  ) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: CreateAutomationRequestDto,
    auth: CreateAutomationAuthDto
  ): Promise<CreateAutomationResponseDto> {
    try {
      const automation: Result<Automation | null> = this.#createAutomation(
        request,
        auth
      );
      if (!automation.value) return automation;

      // TODO Install error handling
      await this.#automationRepository.insertOne(automation.value);

      return Result.ok<AutomationDto>(buildAutomationDto(automation.value));
    } catch (error: any) {
      return Result.fail<AutomationDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #createAutomation = (
    request: CreateAutomationRequestDto,
    auth: CreateAutomationAuthDto
  ): Result<Automation | null> => {
    const automationProperties: AutomationProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      accountId: auth.accountId,
      organizationId: auth.organizationId,
    };

    return Automation.create(automationProperties);
  };
}
