import axios from 'axios';
import { nodeEnv, port, serviceDiscoveryNamespace } from '../../config';
import {
  IGetAccountRepository,
  GetAccountDto as AccountDto,
} from '../../domain/account-api/get-account';
import discoverIp from '../shared/service-discovery';

export default class GetAccountRepositoryImpl implements IGetAccountRepository {
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:8081/${path}`;

    try {
      const ip = await discoverIp(
        serviceDiscoveryNamespace,
        'account-service'
      );

      return `http://${ip}:${port}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public getOne = async (accountId: string): Promise<AccountDto | null> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.get(`${apiRoot}/account/${accountId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
