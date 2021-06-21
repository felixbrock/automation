// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteTarget,
  DeleteTargetRequestDto,
  DeleteTargetResponseDto,
} from '../../../domain/target/delete-target';
import Result from '../../../domain/value-types/transient-types';
import { BaseController, CodeHttp } from '../../shared';

export default class DeleteTargetController extends BaseController {
  #deleteTarget: DeleteTarget;

  public constructor(deleteTarget: DeleteTarget) {
    super();
    this.#deleteTarget = deleteTarget;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteTargetRequestDto> => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return Result.ok<DeleteTargetRequestDto>({
        subscriptionId: httpRequest.params.subscriptionId,
        selectorId,
      });
    return Result.fail<DeleteTargetRequestDto>(
      'request query parameter subscriptionId is supposed to be in string format'
    );
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<DeleteTargetRequestDto> = this.#buildRequestDto(req);

      if(buildDtoResult.error) return DeleteTargetController.badRequest(res, buildDtoResult.error);
      if(!buildDtoResult.value) return DeleteTargetController.badRequest(res, 'Invalid request query paramerters');

      const useCaseResult: DeleteTargetResponseDto =
        await this.#deleteTarget.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return DeleteTargetController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return DeleteTargetController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error) {
      return DeleteTargetController.fail(res, error);
    }
  }
}
