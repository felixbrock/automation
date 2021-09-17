import axios from 'axios';
import { nodeEnv, port, serviceDiscoveryNamespace } from '../../config';
import {
  IGetSelectorRepository,
  GetSelectorDto as SelectorDto,
} from '../../domain/selector-api/get-selector';
import discoverIp from '../shared/service-discovery';

export default class GetSelectorRepositoryImpl
  implements IGetSelectorRepository
{
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:3000/${path}`;

    try {
      const ip = await discoverIp(
        serviceDiscoveryNamespace,
        'selector-service'
      );

      return `http://${ip}:${port}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public getOne = async (selectorId: string): Promise<SelectorDto | null> => {
    try {
      const apiRoot = await this.#getRoot();
      
      const response = await axios.get(`${apiRoot}/selector/${selectorId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
