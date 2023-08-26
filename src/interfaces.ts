import { Reader } from 'mmdb-lib';
import { CityResponse } from 'maxmind';
import EventEmitter from 'events';

export type TEdition = 'City' | 'ASN' | 'Country';

export interface IMaxMindOptions {
  // To receive database updates, you need to obtain a maxmind license key: https://support.maxmind.com/hc/en-us/sections/1260801610490-Manage-my-License-Keys
  licenseKey: string,
  // Max cache items to keep in memory. Default: 6000. https://www.npmjs.com/package/maxmind See "Options"
  maxItemsInCache?: number,
  edition?: TEdition,
  // https://support.maxmind.com/hc/en-us/articles/4408216129947
  // https://crontab.guru/
  // https://cronitor.io/guides/cron-jobs?utm_source=crontabguru&utm_campaign=cron_reference
  // Default: `0 0 * * 3,6` - At 00:00 on Wednesday and Saturday
  updateSchedule?: string,
  // Path to the folder, relative to the project root, where the databases are saved. Default: './db'
  dbDir?: string,
  // Do not interrupt the program execution if it was not possible to initialize the database. Default - undefined (abort)
  noExitOnError?: boolean
  eventEmitter?: EventEmitter
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
  setReader: (reader: Reader<CityResponse>) => void,
  eventEmitter?: EventEmitter,
  ready: boolean,
  checkReady: () => void,
  dbRevision: number, // Timestamp in hours
  dbDir: string, // Absolute path to the folder where the database is loaded

  lookup: (ipAddress: string) => CityResponse | null,
  lookupEx: (ipAddress: string, lang?: string) => CityResponseEx | null,
  transferOptions: (options: IMaxMindOptions) => void,
}
