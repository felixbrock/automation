// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';

import { BaseController, CodeHttp } from '../../shared/base-controller';
import {
  GetAutomationAlerts,
  GetAutomationAlertsRequestDto,
  GetAutomationAlertsResponseDto,
} from '../../../domain/automation/get-alerts';

export default class GetAutomationAlertsController extends BaseController {
  #getAutomationAlerts: GetAutomationAlerts;

  public constructor(getAutomationAlerts: GetAutomationAlerts) {
    super();
    this.#getAutomationAlerts = getAutomationAlerts;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): GetAutomationAlertsRequestDto => ({
    automationId: httpRequest.params.automationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: GetAutomationAlertsRequestDto =
        this.#buildRequestDto(req);
      const useCaseResult: GetAutomationAlertsResponseDto =
        await this.#getAutomationAlerts.execute(requestDto);

      if (useCaseResult.error) {
        return GetAutomationAlertsController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return GetAutomationAlertsController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return GetAutomationAlertsController.fail(res, error);
    }
  }
}
