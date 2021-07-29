import axios from 'axios';
import {
  IGetSelectorRepository,
  GetSelectorDto as SelectorDto,
} from '../../domain/selector-api/get-selector';

const apiRoot = 'http://localhost:3000/api/v1';

export default class GetSelectorRepositoryImpl
  implements IGetSelectorRepository
{
  // TODO Should return a selector object and not a DTO!! When to use a Dto?

  public getOne = async (selectorId: string): Promise<SelectorDto | null> => {
    try {
      const response = await axios.get(`${apiRoot}/selector/${selectorId}`);
      const jsonResponse = await response.data;
      if (response.status === 200) return jsonResponse;
      throw new Error(jsonResponse);
    } catch (error) {
      return null;
    }
  };
}
