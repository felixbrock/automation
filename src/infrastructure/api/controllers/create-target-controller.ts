// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateTarget,
  CreateTargetRequestDto,
  CreateTargetResponseDto,
} from '../../../domain/use-cases/create-target';
import { BaseController, CodeHttp } from '../../shared';

export default class CreateTargetController extends BaseController {
  #createTarget: CreateTarget;

  public constructor(createTarget: CreateTarget) {
    super();
    this.#createTarget = createTarget;
  }

  #buildRequestDto = (httpRequest: Request): CreateTargetRequestDto => ({
    subscriptionId: httpRequest.params.subscriptionId,
    systemId: httpRequest.body.systemId,
    selectorId: httpRequest.body.selectorId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateTargetRequestDto = this.#buildRequestDto(req);
      const useCaseResult: CreateTargetResponseDto =
        await this.#createTarget.execute(requestDto);

      if (useCaseResult.error) {
        return CreateTargetController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return CreateTargetController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error) {
      return CreateTargetController.fail(res, error);
    }
  }
}
