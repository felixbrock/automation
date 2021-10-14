import axios, { AxiosRequestConfig } from 'axios';
import {
  IGetSystemRepository,
  SystemDto,
} from '../../domain/system-api/get-system';
import getRoot from '../shared/api-root-builder';

export default class GetSystemRepositoryImpl implements IGetSystemRepository {
  #path = 'api/v1';

  #serviceName = 'system';

  #port = '3002';

  public getOne = async (
    systemId: string,
    jwt: string
  ): Promise<SystemDto> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const config: AxiosRequestConfig = {
        headers: { Authorization: `Bearer ${jwt}` },
      };

      const response = await axios.get(`${apiRoot}/system/${systemId}`, config);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse.response.data.message);
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };
}
