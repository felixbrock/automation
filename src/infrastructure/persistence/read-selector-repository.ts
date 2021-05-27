import fetch from 'node-fetch';
import { IReadSelectorRepository } from '../../domain/use-cases/read-selector';

export default class ReadSelectorRepositoryImpl
  implements IReadSelectorRepository
{
  public getSelectorContent = async (
    selectorId: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/selector/${selectorId}`
      );
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse.content;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  public getSystemName = async (systemId: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/system/${systemId}`
      );
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse.name;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
}
