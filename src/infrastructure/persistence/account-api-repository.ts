import axios from 'axios';
import {
  IGetAccountRepository,
  GetAccountDto as AccountDto,
} from '../../domain/account-api/get-account';

const apiRoot = 'http://localhost:8081/api/v1';

export default class GetAccountRepositoryImpl
  implements IGetAccountRepository
{
  public getOne = async (accountId: string): Promise<AccountDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/account/${accountId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}