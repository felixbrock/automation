import {IUseCase, Result} from '../shared';
import { Alert, AlertProps } from '../object-types/entities';

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

  public constructor(createAlertRepository: ICreateAlertRepository) {
    this.#createAlertRepository = createAlertRepository;
  }

  public async execute(
    request: CreateAlertRequestDto
  ): Promise<CreateAlertResponseDto> {
    const alert: Result<Alert | null> =
      this.#createAlert(request);
    if (!alert.value) return alert;

    try {
      await this.#createAlertRepository.save(alert.value);

      return Result.ok<CreateAlertDto>(
        this.#buildAlertDto(alert.value)
      );
    } catch (error) {
      return Result.fail<CreateAlertDto>(error.message);
    }
  }

  #buildAlertDto = (alert: Alert): CreateAlertDto => ({
    selectorId: alert.selectorId,
    systemId: alert.systemId,
    createdOn: alert.createdOn,
  });

  #createAlert = (
    request: CreateAlertRequestDto
  ): Result<Alert | null> => {
    const alertProps: AlertProps = {
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Alert.create(alertProps);
  };
}
