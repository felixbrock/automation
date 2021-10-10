// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import { GetAccounts } from '../../../domain/account-api/get-accounts';
import {
  CreateSubscription,
  CreateSubscriptionAuthDto,
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
} from '../../../domain/subscription/create-subscription';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateSubscriptionController extends BaseController {
  #createSubscription: CreateSubscription;

  #getAccounts: GetAccounts;

  public constructor(
    createSubscription: CreateSubscription,
    getAccounts: GetAccounts
  ) {
    super();
    this.#createSubscription = createSubscription;
    this.#getAccounts = getAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateSubscriptionRequestDto => ({
    automationId: httpRequest.params.automationId,
    systemId: httpRequest.body.systemId,
    selectorId: httpRequest.body.selectorId,
  });

  #buildAuthDto = (
    userAccountInfo: UserAccountInfo,
    jwt: string
  ): CreateSubscriptionAuthDto => ({
    organizationId: userAccountInfo.organizationId,
    jwt,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.headers.authorization;

      if (!token)
        return CreateSubscriptionController.unauthorized(res, 'Unauthorized');

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateSubscriptionController.getUserAccountInfo(
          token,
          this.#getAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateSubscriptionController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateSubscriptionRequestDto =
        this.#buildRequestDto(req);
      const authDto: CreateSubscriptionAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value,
        token
      );

      const useCaseResult: CreateSubscriptionResponseDto =
        await this.#createSubscription.execute(requestDto, authDto);

      if (useCaseResult.error) {
        return CreateSubscriptionController.badRequest(
          res,
          useCaseResult.error
        );
      }

      return CreateSubscriptionController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateSubscriptionController.fail(res, error);
    }
  }
}
