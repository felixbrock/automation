import axios from 'axios';
import {
  IGetSelectorRepository,
  GetSelectorDto as SelectorDto,
} from '../../domain/selector-api/get-selector';

const apiRoot = 'http://localhost:3000/api/v1';

export default class GetSelectorRepositoryImpl
  implements IGetSelectorRepository
{
  public getOne = async (selectorId: string): Promise<SelectorDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/selector/${selectorId}`);
      const jsonResponse = response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
