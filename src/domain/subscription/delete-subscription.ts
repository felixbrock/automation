import IUseCase from '../services/use-case';
import { ReadAutomation } from '../automation/read-automation';
import { AutomationDto } from '../automation/automation-dto';
import Result from '../value-types/transient-types/result';
import { IAutomationRepository } from '../automation/i-automation-repository';

export interface DeleteSubscriptionRequestDto {
  automationId: string;
  selectorId: string;
}

export interface DeleteSubscriptionAuthDto {
  organizationId: string;
}

export type DeleteSubscriptionResponseDto = Result<string>;

export class DeleteSubscription
  implements
    IUseCase<
      DeleteSubscriptionRequestDto,
      DeleteSubscriptionResponseDto,
      DeleteSubscriptionAuthDto
    >
{
  #automationRepository: IAutomationRepository;

  #readAutomation: ReadAutomation;

  public constructor(
    automationRepository: IAutomationRepository,
    readAutomation: ReadAutomation
  ) {
    this.#automationRepository = automationRepository;
    this.#readAutomation = readAutomation;
  }

  public async execute(
    request: DeleteSubscriptionRequestDto,
    auth: DeleteSubscriptionAuthDto
  ): Promise<DeleteSubscriptionResponseDto> {
    try {
      const readAutomationResult: Result<AutomationDto> =
        await this.#readAutomation.execute(
          { id: request.automationId },
          { organizationId: auth.organizationId }
        );

      if (readAutomationResult.error)
        throw new Error(readAutomationResult.error);
      if (!readAutomationResult.value)
        throw new Error(`Couldn't read automation ${request.automationId}`);

      if (readAutomationResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const deleteSubscriptionResult: string =
        await this.#automationRepository.deleteSubscription(
          request.automationId,
          request.selectorId
        );

      return Result.ok(deleteSubscriptionResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
