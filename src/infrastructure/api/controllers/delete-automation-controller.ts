// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteAutomation,
  DeleteAutomationRequestDto,
  DeleteAutomationResponseDto,
} from '../../../domain/automation/delete-automation';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class DeleteAutomationController extends BaseController {
  #deleteAutomation: DeleteAutomation;

  public constructor(deleteAutomation: DeleteAutomation) {
    super();
    this.#deleteAutomation = deleteAutomation;
  }

  #buildRequestDto = (httpRequest: Request): DeleteAutomationRequestDto => ({
    automationId: httpRequest.params.automationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: DeleteAutomationRequestDto =
        this.#buildRequestDto(req);

      const useCaseResult: DeleteAutomationResponseDto =
        await this.#deleteAutomation.execute(requestDto);

      if (useCaseResult.error) {
        return DeleteAutomationController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteAutomationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return DeleteAutomationController.fail(res, error);
    }
  }
}
