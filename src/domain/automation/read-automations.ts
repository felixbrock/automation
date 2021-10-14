import { Automation } from '../entities/automation';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {
  IAutomationRepository,
  AutomationQueryDto,
} from './i-automation-repository';
import { buildAutomationDto, AutomationDto } from './automation-dto';

export interface ReadAutomationsRequestDto {
  name?: string;
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

export interface ReadAutomationsAuthDto {
  organizationId: string;
}

export type ReadAutomationsResponseDto = Result<AutomationDto[]>;

export class ReadAutomations
  implements
    IUseCase<
      ReadAutomationsRequestDto,
      ReadAutomationsResponseDto,
      ReadAutomationsAuthDto
    >
{
  #automationRepository: IAutomationRepository;

  public constructor(automationRepository: IAutomationRepository) {
    this.#automationRepository = automationRepository;
  }

  public async execute(
    request: ReadAutomationsRequestDto,
    auth: ReadAutomationsAuthDto
  ): Promise<ReadAutomationsResponseDto> {
    try {
      const automations: Automation[] = await this.#automationRepository.findBy(
        this.#buildAutomationQueryDto(request, auth.organizationId)
      );
      if (!automations) throw new Error(`Queried automations do not exist`);

      return Result.ok(
        automations.map((automation) => buildAutomationDto(automation))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildAutomationQueryDto = (
    request: ReadAutomationsRequestDto,
    organizationId: string
  ): AutomationQueryDto => {
    const queryDto: AutomationQueryDto = {};

    if (request.name) queryDto.name = request.name;
    if (request.accountId) queryDto.accountId = request.accountId;
    queryDto.organizationId = organizationId;
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
