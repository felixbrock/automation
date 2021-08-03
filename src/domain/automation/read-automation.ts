import { Automation } from '../entities/automation';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {IAutomationRepository} from './i-automation-repository';
import {AutomationDto, buildAutomationDto } from './automation';

export interface ReadAutomationRequestDto {
  id: string;
}

export type ReadAutomationResponseDto = Result<AutomationDto | null>;

export class ReadAutomation
  implements IUseCase<ReadAutomationRequestDto, ReadAutomationResponseDto>
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: ReadAutomationRequestDto
  ): Promise<ReadAutomationResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.id);
      if (!automation)
        throw new Error(
          `Automation with id ${request.id} does not exist`
        );

      return Result.ok<AutomationDto>(
        buildAutomationDto(automation)
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
