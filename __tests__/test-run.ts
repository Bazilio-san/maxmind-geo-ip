import * as configModule from 'config';
import { IMaxMindConfig, startGeoIP } from '../src';

export const config: IMaxMindConfig = configModule.util.toObject();

const testRun = async () => {
  const geoIp = await startGeoIP({ ...config.maxMind, dbDir: './db_test', updateSchedule: '0/1 * * * *' });
  const result = geoIp?.lookupEx('103.100.173.193', 'en');
  // eslint-disable-next-line no-console
  console.log(result);
};

testRun().then(() => 0);
