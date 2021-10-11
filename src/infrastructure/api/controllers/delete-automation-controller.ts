// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  DeleteAutomation,
  DeleteAutomationAuthDto,
  DeleteAutomationRequestDto,
  DeleteAutomationResponseDto,
} from '../../../domain/automation/delete-automation';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class DeleteAutomationController extends BaseController {
  #deleteAutomation: DeleteAutomation;

  #getAccounts: GetAccounts;

  public constructor(
    deleteAutomation: DeleteAutomation,
    getAccounts: GetAccounts
  ) {
    super();
    this.#deleteAutomation = deleteAutomation;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): DeleteAutomationRequestDto => ({
    automationId: httpRequest.params.automationId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): DeleteAutomationAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return DeleteAutomationController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];     

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await DeleteAutomationController.getUserAccountInfo(
          jwt,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return DeleteAutomationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: DeleteAutomationRequestDto = this.#buildRequestDto(req);
      const authDto: DeleteAutomationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: DeleteAutomationResponseDto =
        await this.#deleteAutomation.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return DeleteAutomationController.badRequest(res, useCaseResult.error);
      }

      return DeleteAutomationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.OK
      );
    } catch (error: any) {
      return DeleteAutomationController.fail(res, error);
    }
  }
}
