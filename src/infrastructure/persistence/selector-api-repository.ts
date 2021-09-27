import axios from 'axios';
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

  public getOne = async (selectorId: string): Promise<SelectorDto | null> => {
    try {
      const apiRoot = await getRoot(this.#serviceName, this.#port, this.#path);

      const response = await axios.get(`${apiRoot}/selector/${selectorId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error: any) {
      return null;
    }
  };
}
