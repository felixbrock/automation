// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  ReadAutomation,
  ReadAutomationAuthDto,
  ReadAutomationRequestDto,
  ReadAutomationResponseDto,
} from '../../../domain/automation/read-automation';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp, UserAccountInfo } from '../../shared/base-controller';

export default class ReadAutomationController extends BaseController {
  #readAutomation: ReadAutomation;

  #getAccounts: GetAccounts;

  public constructor(readAutomation: ReadAutomation, getAccounts: GetAccounts) {
    super();
    this.#readAutomation = readAutomation;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): ReadAutomationRequestDto => ({
    id: httpRequest.params.automationId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo
  ): ReadAutomationAuthDto => ({
    organizationId: userAccountInfo.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return ReadAutomationController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await ReadAutomationController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return ReadAutomationController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: ReadAutomationRequestDto = this.#buildRequestDto(req);
      const authDto: ReadAutomationAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: ReadAutomationResponseDto =
        await this.#readAutomation.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return ReadAutomationController.badRequest(res, useCaseResult.error);
      }

      return ReadAutomationController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadAutomationController.fail(res, error);
    }
  }
}
