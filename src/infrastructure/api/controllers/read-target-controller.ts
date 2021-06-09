// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadTarget,
  ReadTargetResponseDto,
} from '../../../domain/use-cases/read-target';
import { BaseController, CodeHttp } from '../../shared';

export default class ReadTargetController extends BaseController {
  #readTarget: ReadTarget;

  public constructor(readTarget: ReadTarget) {
    super();
    this.#readTarget = readTarget;
  }

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    const { subscriptionId } = req.params;
    const { selectorId } = req.query;

    if (!selectorId)
      return ReadTargetController.badRequest(
        res,
        'selectorId and/or systemId query parameter must be provided'
      );
    if (selectorId && typeof selectorId !== 'string')
      return ReadTargetController.badRequest(
        res,
        'Invalid format of selectorId query parameter. Desired format: string'
      );

    try {
      const useCaseResult: ReadTargetResponseDto =
        await this.#readTarget.execute({
          subscriptionId,
          selectorId,
        });

      if (useCaseResult.error)
        return ReadTargetController.badRequest(res, useCaseResult.error);

      return ReadTargetController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error) {
      return ReadTargetController.fail(res, error);
    }
  }
}
