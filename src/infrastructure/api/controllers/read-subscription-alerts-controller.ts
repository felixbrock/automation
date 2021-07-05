// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';

import { BaseController, CodeHttp } from '../../shared/base-controller';
import {
  GetSubscriptionAlerts,
  GetSubscriptionAlertsRequestDto,
  GetSubscriptionAlertsResponseDto,
} from '../../../domain/subscription/get-alerts';

export default class GetSubscriptionAlertsController extends BaseController {
  #getSubscriptionAlerts: GetSubscriptionAlerts;

  public constructor(getSubscriptionAlerts: GetSubscriptionAlerts) {
    super();
    this.#getSubscriptionAlerts = getSubscriptionAlerts;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): GetSubscriptionAlertsRequestDto => ({
    subscriptionId: httpRequest.params.subscriptionId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: GetSubscriptionAlertsRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: GetSubscriptionAlertsResponseDto =
        await this.#getSubscriptionAlerts.execute(requestDto);

      if (useCaseResult.error) {
        return GetSubscriptionAlertsController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return GetSubscriptionAlertsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return GetSubscriptionAlertsController.fail(res, error);
    }
  }
}
