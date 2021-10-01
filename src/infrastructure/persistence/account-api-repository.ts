import axios from 'axios';
import {
  IAccountRepository,
  GetAccountDto,
} from '../../domain/account-api/get-account';
import getRoot from '../shared/api-root-builder';

export default class AccountRepositoryImpl implements IAccountRepository {
  #path = 'api/v1';

  #serviceName = 'account';

  #port = '8081';

  public getOne = async (accountId: string): Promise<GetAccountDto | null> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const response = await axios.get(`${apiRoot}/account/${accountId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
