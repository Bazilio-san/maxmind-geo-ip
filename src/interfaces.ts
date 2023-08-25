import { Reader } from 'mmdb-lib';
import { CityResponse } from 'maxmind';

export type TEdition = 'City' | 'ASN' | 'Country';

export interface IMaxMindOptions {
  licenseKey: string,
  maxItemsInCache?: number,
  edition?: TEdition,
  updateSchedule?: string,
  noExitOnError?: boolean
}

export interface IMaxMindConfig {
  maxMind: IMaxMindOptions,
}

export interface CityResponseEx {
  continent?: string;
  continentCode?: string;
  country?: string;
  countryISOCode?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  postalCode?: string;
  subdivision?: string;
}

export interface IGeoIP {
  reader?: Reader<CityResponse>
  ready: boolean,
  checkReady: () => void,
  dbRevision: number, // Метка времени в часах

  lookup: (ipAddress: string) => CityResponse | null,
  lookupEx: (ipAddress: string, lang?: string) => CityResponseEx | null,
}
