import axios from 'axios';
import { nodeEnv, serviceDiscoveryNamespace } from '../../config';
import {
  IGetSystemRepository,
  SystemDto,
} from '../../domain/system-api/get-system';
import discoverIp from '../shared/service-discovery';

export default class GetSystemRepositoryImpl implements IGetSystemRepository {
  #getRoot = async (): Promise<string> => {
    const path = 'api/v1';

    if (nodeEnv !== 'production') return `http://localhost:3002/${path}`;

    try {
      const ip = await discoverIp(serviceDiscoveryNamespace, 'system-service');

      return `http://${ip}/${path}`;
    } catch (error: any) {
      return Promise.reject(typeof error === 'string' ? error : error.message);
    }
  };

  public getOne = async (systemId: string): Promise<SystemDto | null> => {
    try {
      const apiRoot = await this.#getRoot();

      const response = await axios.get(`${apiRoot}/system/${systemId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
