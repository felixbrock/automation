// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAutomation,
  ReadAutomationRequestDto,
  ReadAutomationResponseDto,
} from '../../../domain/automation/read-automation';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadAutomationController extends BaseController {
  #readAutomation: ReadAutomation;

  public constructor(readAutomation: ReadAutomation) {
    super();
    this.#readAutomation = readAutomation;
  }

  #buildRequestDto = (httpRequest: Request): ReadAutomationRequestDto => ({
    id: httpRequest.params.automationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadAutomationRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadAutomationResponseDto =
        await this.#readAutomation.execute(requestDto);

      if (useCaseResult.error) {
        return ReadAutomationController.badRequest(res, useCaseResult.error);
      }

      return ReadAutomationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return ReadAutomationController.fail(res, error);
    }
  }
}
