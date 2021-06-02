// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';

import { BaseController, CodeHttp } from '../../shared';
import {
  ReadSubscriptionAlerts,
  ReadSubscriptionAlertsRequestDto,
  ReadSubscriptionAlertsResponseDto,
} from '../../../domain/use-cases/read-subscription-alerts';

export default class ReadSubscriptionAlertsController extends BaseController {
  #readSubscriptionAlerts: ReadSubscriptionAlerts;

  public constructor(readSubscriptionAlerts: ReadSubscriptionAlerts) {
    super();
    this.#readSubscriptionAlerts = readSubscriptionAlerts;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): ReadSubscriptionAlertsRequestDto => ({
    id: httpRequest.params.id,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadSubscriptionAlertsRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: ReadSubscriptionAlertsResponseDto =
        await this.#readSubscriptionAlerts.execute(requestDto);

      if (useCaseResult.error) {
        return ReadSubscriptionAlertsController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return ReadSubscriptionAlertsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadSubscriptionAlertsController.fail(res, error);
    }
  }
}
