import { nodeEnv, serviceDiscoveryNamespace } from '../../config';
import { DiscoveredService, discoverService } from './service-discovery';

export default async (
  serviceName: string,
  port: string,
  path: string
): Promise<string> => {
  try {
    if (nodeEnv === 'development') return `http://localhost:${port}/${path}`;

    const discoveredService: DiscoveredService = await discoverService(
      serviceDiscoveryNamespace,
      `${serviceName}-service`
    );

    return `http://${discoveredService.ip}:${discoveredService.port}/${path}`;
  } catch (error: any) {
    return Promise.reject(typeof error === 'string' ? error : error.message);
  }
};
