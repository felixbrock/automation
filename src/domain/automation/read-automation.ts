import { Automation } from '../entities/automation';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IAutomationRepository } from './i-automation-repository';
import { AutomationDto, buildAutomationDto } from './automation-dto';

export interface ReadAutomationRequestDto {
  id: string;
}

export interface ReadAutomationAuthDto {
  organizationId: string;
}

export type ReadAutomationResponseDto = Result<AutomationDto | null>;

export class ReadAutomation
  implements
    IUseCase<
      ReadAutomationRequestDto,
      ReadAutomationResponseDto,
      ReadAutomationAuthDto
    >
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: ReadAutomationRequestDto,
    auth: ReadAutomationAuthDto
  ): Promise<ReadAutomationResponseDto> {
    try {
      const automation: Automation | null =
        await this.#automationRepository.findOne(request.id);
      if (!automation)
        throw new Error(`Automation with id ${request.id} does not exist`);

      if (automation.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      return Result.ok<AutomationDto>(buildAutomationDto(automation));
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
