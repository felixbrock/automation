import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IAutomationRepository } from './i-automation-repository';
import { ReadAutomation } from './read-automation';
import { AutomationDto } from './automation';

export interface DeleteAutomationRequestDto {
  automationId: string;
}

export type DeleteAutomationResponseDto = Result<null>;

export class DeleteAutomation
  implements
    IUseCase<DeleteAutomationRequestDto, DeleteAutomationResponseDto>
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
    request: DeleteAutomationRequestDto
  ): Promise<DeleteAutomationResponseDto> {
    try {
      const readAutomationResult: Result<AutomationDto | null> =
        await this.#readAutomation.execute({ id: request.automationId });

      if (readAutomationResult.error)
        throw new Error(readAutomationResult.error);
      if (!readAutomationResult.value)
        throw new Error(`Couldn't read automation ${request.automationId}`);

      const deleteAutomationResult: Result<null> =
        await this.#automationRepository.delete(request.automationId);

      if (deleteAutomationResult.error)
        throw new Error(deleteAutomationResult.error);

      return Result.ok<null>();
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
