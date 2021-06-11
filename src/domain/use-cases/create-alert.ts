import { IUseCase, Result } from '../shared';
import { Alert, AlertProps } from '../entities';
import { ReadSelector, ReadSelectorResponseDto } from './read-selector';

export interface CreateAlertRequestDto {
  selectorId: string;
  systemId: string;
}

export interface CreateAlertDto {
  selectorId: string;
  systemId: string;
  createdOn: number;
}

export type CreateAlertResponseDto = Result<CreateAlertDto | null>;

export interface ICreateAlertRepository {
  save(alert: Alert): Promise<void>;
}

export class CreateAlert
  implements IUseCase<CreateAlertRequestDto, CreateAlertResponseDto>
{
  #createAlertRepository: ICreateAlertRepository;

  #readSelector: ReadSelector;

  public constructor(
    createAlertRepository: ICreateAlertRepository,
    readSelector: ReadSelector
  ) {
    this.#createAlertRepository = createAlertRepository;
    this.#readSelector = readSelector;
  }

  public async execute(
    request: CreateAlertRequestDto
  ): Promise<CreateAlertResponseDto> {
    const alert: Result<Alert | null> = this.#createAlert(request);
    if (!alert.value) return alert;

    try {
      const validatedRequest = await this.validateRequest(alert.value);
      if (validatedRequest.error)
        return Result.fail<CreateAlertDto>(validatedRequest.error);

      await this.#createAlertRepository.save(alert.value);

      return Result.ok<CreateAlertDto>(this.#buildAlertDto(alert.value));
    } catch (error) {
      return Result.fail<CreateAlertDto>(error.message);
    }
  }

  private async validateRequest(alert: Alert): Promise<Result<null>> {
    const readSelectorResponse: ReadSelectorResponseDto =
      await this.#readSelector.execute({
        id: alert.selectorId,
      });

    if (readSelectorResponse.error)
      return Result.fail<null>(readSelectorResponse.error);
    if (!readSelectorResponse.value)
      return Result.fail<null>(
        `No selector was found for id ${alert.selectorId}`
      );

    if (readSelectorResponse.value?.systemId !== alert.systemId)
      return Result.fail<null>(
        `Provided system id ${alert.systemId} doesn't match the selector's system ${readSelectorResponse.value.systemId}`
      );

    return Result.ok<null>(null);
  }

  #buildAlertDto = (alert: Alert): CreateAlertDto => ({
    selectorId: alert.selectorId,
    systemId: alert.systemId,
    createdOn: alert.createdOn,
  });

  #createAlert = (request: CreateAlertRequestDto): Result<Alert | null> => {
    const alertProps: AlertProps = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Alert.create(alertProps);
  };
}
