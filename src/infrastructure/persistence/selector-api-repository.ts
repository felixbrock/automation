import axios, { AxiosRequestConfig } from 'axios';
import {
  IGetSelectorRepository,
  GetSelectorDto as SelectorDto,
} from '../../domain/selector-api/get-selector';
import getRoot from '../shared/api-root-builder';

export default class GetSelectorRepositoryImpl
  implements IGetSelectorRepository
{
  #path = 'api/v1';

  #serviceName = 'selector';

  #port = '3000';

  public getOne = async (selectorId: string, jwt: string): Promise<SelectorDto> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` }
      };

      const response = await axios.get(`${apiRoot}/selector/${selectorId}`, config);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse.response.data.message);
    } catch (error: unknown) {
      if(typeof error === 'string') return Promise.reject(error);
      if(error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };
}
