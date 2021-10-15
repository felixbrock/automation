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

export type CreateAutomationResponseDto = Result<AutomationDto>;

export class CreateAutomation
  implements
    IUseCase<
      CreateAutomationRequestDto,
      CreateAutomationResponseDto,
      CreateAutomationAuthDto
    >
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: CreateAutomationRequestDto,
    auth: CreateAutomationAuthDto
  ): Promise<CreateAutomationResponseDto> {
    try {
      const automation: Automation = this.#createAutomation(
        request,
        auth
      );

      await this.#automationRepository.insertOne(automation);

      return Result.ok(buildAutomationDto(automation));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #createAutomation = (
    request: CreateAutomationRequestDto,
    auth: CreateAutomationAuthDto
  ): Automation => {
    const automationProperties: AutomationProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
      accountId: auth.accountId,
      organizationId: auth.organizationId,
    };

    return Automation.create(automationProperties);
  };
}
