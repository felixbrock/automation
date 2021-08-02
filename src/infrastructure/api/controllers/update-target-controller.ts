// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  UpdateTarget,
  UpdateTargetRequestDto,
  UpdateTargetResponseDto,
} from '../../../domain/target/update-target';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class UpdateTargetController extends BaseController {
  #updateTarget: UpdateTarget;

  public constructor(updateTarget: UpdateTarget) {
    super();
    this.#updateTarget = updateTarget;
  }

  #buildRequestDto = (httpRequest: Request): UpdateTargetRequestDto => ({
    subscriptionId: httpRequest.params.subscriptionId,
    selectorId: httpRequest.body.selectorId,
    alertsAccessedOn: httpRequest.body.alertsAccessedOn || undefined,
    alertsAccessedOnByUser: httpRequest.body.alertsAccessedOnByUser || undefined,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: UpdateTargetRequestDto = this.#buildRequestDto(req);
      const useCaseResult: UpdateTargetResponseDto =
        await this.#updateTarget.execute(requestDto);

      if (useCaseResult.error) {
        return UpdateTargetController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return UpdateTargetController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return UpdateTargetController.fail(res, error);
    }
  }
}
