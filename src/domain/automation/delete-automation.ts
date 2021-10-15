import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IAutomationRepository } from './i-automation-repository';
import { ReadAutomation } from './read-automation';
import { AutomationDto } from './automation-dto';

export interface DeleteAutomationRequestDto {
  automationId: string;
}

export interface DeleteAutomationAuthDto {
  organizationId: string;
}

export type DeleteAutomationResponseDto = Result<string>;

export class DeleteAutomation
  implements
    IUseCase<
      DeleteAutomationRequestDto,
      DeleteAutomationResponseDto,
      DeleteAutomationAuthDto
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
    request: DeleteAutomationRequestDto,
    auth: DeleteAutomationAuthDto
  ): Promise<DeleteAutomationResponseDto> {
    try {
      const readAutomationResult: Result<AutomationDto> =
        await this.#readAutomation.execute(
          { id: request.automationId },
          { organizationId: auth.organizationId }
        );

      if (!readAutomationResult.success)
        throw new Error(readAutomationResult.error);
      if (!readAutomationResult.value)
        throw new Error(`Couldn't read automation ${request.automationId}`);

      if (readAutomationResult.value.organizationId !== auth.organizationId)
        throw new Error('Not authorized to perform action');

      const deleteAutomationResult: string =
        await this.#automationRepository.deleteOne(request.automationId);

      return Result.ok(deleteAutomationResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
