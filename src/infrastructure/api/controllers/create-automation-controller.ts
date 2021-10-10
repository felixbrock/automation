// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateAutomation,
  CreateAutomationAuthDto,
  CreateAutomationRequestDto,
  CreateAutomationResponseDto,
} from '../../../domain/automation/create-automation';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateAutomationController extends BaseController {
  #createAutomation: CreateAutomation;

  #getAccounts: GetAccounts;

  public constructor(
    createAutomation: CreateAutomation,
    getAccounts: GetAccounts
  ) {
    super();
    this.#createAutomation = createAutomation;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateAutomationRequestDto => ({
    name: httpRequest.body.name,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): CreateAutomationAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    accountId: userAccountInfo.accountId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return CreateAutomationController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateAutomationController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateAutomationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateAutomationRequestDto = this.#buildRequestDto(req);
      const authDto: CreateAutomationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateAutomationResponseDto =
        await this.#createAutomation.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return CreateAutomationController.badRequest(res, useCaseResult.error);
      }

      return CreateAutomationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateAutomationController.fail(res, error);
    }
  }
}
