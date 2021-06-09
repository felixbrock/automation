// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { CreateAlert, CreateAlertRequestDto, CreateAlertResponseDto } from '../../../domain/use-cases/create-alert';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateAlertController extends BaseController {
  #createAlert: CreateAlert;

  public constructor(createAlert: CreateAlert) {
    super();
    this.#createAlert = createAlert;
  }

  #buildRequestDto = (httpRequest: Request): CreateAlertRequestDto => ({
      systemId: httpRequest.body.systemId,
      selectorId: httpRequest.body.selectorId,
    })

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto : CreateAlertRequestDto = this.#buildRequestDto(req);
      const useCaseResult : CreateAlertResponseDto = await this.#createAlert.execute(requestDto);

      if (useCaseResult.error) {
        return CreateAlertController.badRequest(res, useCaseResult.error);
      }

      return CreateAlertController.ok(res, useCaseResult.value, CodeHttp.CREATED);
    } catch (error) {
      return CreateAlertController.fail(res, error);
    }
  }
}
