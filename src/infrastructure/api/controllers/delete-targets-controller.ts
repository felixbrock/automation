// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  DeleteTargets,
  DeleteTargetsRequestDto,
  DeleteTargetsResponseDto,
} from '../../../domain/target/delete-targets';
import Result from '../../../domain/value-types/transient-types';
import { BaseController, CodeHttp } from '../../shared';

export default class DeleteTargetsController extends BaseController {
  #deleteTargets: DeleteTargets;

  public constructor(deleteTargets: DeleteTargets) {
    super();
    this.#deleteTargets = deleteTargets;
  }

  #buildRequestDto = (
    httpRequest: Request
  ): Result<DeleteTargetsRequestDto> => {
    const { selectorId } = httpRequest.query;
    if (typeof selectorId === 'string')
      return Result.ok<DeleteTargetsRequestDto>({
        selectorId,
      });
    return Result.fail<DeleteTargetsRequestDto>(
      'request query parameter subscriptionId is supposed to be in string format'
    );
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<DeleteTargetsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return DeleteTargetsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return DeleteTargetsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: DeleteTargetsResponseDto =
        await this.#deleteTargets.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return DeleteTargetsController.badRequest(res, useCaseResult.error);
      }

      return DeleteTargetsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error) {
      return DeleteTargetsController.fail(res, error);
    }
  }
}
