import { Automation } from '../entities/automation';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {
  IAutomationRepository,
  AutomationQueryDto,
} from './i-automation-repository';
import { buildAutomationDto, AutomationDto } from './automation';

export interface ReadAutomationsRequestDto {
  automationName?: string;
  accountId?: string;
  subscription?: {
    selectorId?: string;
    systemId?: string;
    alertsAccessedOnStart?: number;
    alertsAccessedOnEnd?: number;
    alertsAccessedOnByUserStart?: number;
    alertsAccessedOnByUserEnd?: number;
  };
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export type ReadAutomationsResponseDto = Result<AutomationDto[] | null>;

export class ReadAutomations
  implements
    IUseCase<ReadAutomationsRequestDto, ReadAutomationsResponseDto>
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: ReadAutomationsRequestDto
  ): Promise<ReadAutomationsResponseDto> {
    try {
      const automations: Automation[] =
        await this.#automationRepository.findBy(
          this.#buildAutomationQueryDto(request)
        );
      if (!automations) throw new Error(`Queried automations do not exist`);

      return Result.ok<AutomationDto[]>(
        automations.map((automation) => buildAutomationDto(automation))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }

  #buildAutomationQueryDto = (
    request: ReadAutomationsRequestDto
  ): AutomationQueryDto => {
    const queryDto: AutomationQueryDto = {};

    if (request.automationName)
      queryDto.automationName = request.automationName;
    if (request.accountId) queryDto.accountId = request.accountId;
    if (
      request.subscription &&
      (request.subscription.selectorId ||
        request.subscription.systemId ||
        request.subscription.alertsAccessedOnStart ||
        request.subscription.alertsAccessedOnEnd ||
        request.subscription.alertsAccessedOnByUserStart ||
        request.subscription.alertsAccessedOnByUserEnd)
    )
      queryDto.subscription = request.subscription;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
