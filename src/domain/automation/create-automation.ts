// TODO Violation of Dependency Rule
import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../services/use-case';
import Id from '../value-types/id';
import { Automation, AutomationProperties } from '../entities/automation';
import {buildAutomationDto, AutomationDto} from './automation';
import {IAutomationRepository} from './i-automation-repository';
import Result from '../value-types/transient-types/result';

export interface CreateAutomationRequestDto {
  name: string;
  accountId: string;
}

export type CreateAutomationResponseDto = Result<AutomationDto | null>;

export class CreateAutomation
  implements
    IUseCase<CreateAutomationRequestDto, CreateAutomationResponseDto>
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: CreateAutomationRequestDto
  ): Promise<CreateAutomationResponseDto> {
    const automation: Result<Automation | null> =
      this.#createAutomation(request);
    if (!automation.value) return automation;

    try {
      // TODO Install error handling
      await this.#automationRepository.save(automation.value);

      return Result.ok<AutomationDto>(
        buildAutomationDto(automation.value)
      );
    } catch (error) {
      return Result.fail<AutomationDto>(error.message);
    }
  }

  #createAutomation = (
    request: CreateAutomationRequestDto
  ): Result<Automation | null> => {
    const automationProperties: AutomationProperties = {
      id: Id.next(uuidv4).id,
      name: request.name,
      accountId: request.accountId,
    };

    return Automation.create(automationProperties);
  };
}
