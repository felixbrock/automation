import { v4 as uuidv4 } from 'uuid';
import IUseCase from '../shared';
import { Id, Result } from '../entities/value-types';
import { Alert, AlertProps } from '../entities/reference-types';

export interface CreateAlertRequestDto {
  selectorId: string;
  systemId: string;
}

export type CreateAlertResponseDto = Result<CreateAlertDto | null>;

export interface CreateAlertDto {
  id: string;
  selectorId: string;
  systemId: string;
  createdOn: number;
}

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

  // TODO return resolve or reject promis return instead

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
    id: alert.id,
    selectorId: alert.selectorId,
    systemId: alert.systemId,
    createdOn: alert.createdOn,
  });

  #createAlert = (
    request: CreateAlertRequestDto
  ): Result<Alert | null> => {
    const alertProps: AlertProps = {
      id: Id.next(uuidv4).id,
      selectorId: request.selectorId,
      systemId: request.systemId,
    };

    return Alert.create(alertProps);
  };
}
