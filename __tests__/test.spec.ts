/* eslint-disable no-console */
import * as configModule from 'config';
import { IMaxMindConfig, startGeoIP } from '../src';
import ee from './ee';

export const config: IMaxMindConfig = configModule.util.toObject();

const expected = {
  continent: 'Asia',
  continentCode: 'AS',
  country: 'Indonesia',
  countryISOCode: 'ID',
  city: undefined,
  latitude: -6.1728,
  longitude: 106.8272,
  postalCode: undefined,
  subdivision: undefined,
};

ee.on('geo-ip-ready', (v) => {
  console.log('geo-ip-ready', v);
});
ee.on('geo-ip-change-revision', (v) => {
  console.log('geo-ip-change-revision', v);
});

test(`The database must be initialized and work correctly`, async () => {
  const geoIp = await startGeoIP({ ...config.maxMind, eventEmitter: ee });
  const result = geoIp?.lookupEx('103.100.173.193', 'en');
  expect(result).toEqual(expected);
});
