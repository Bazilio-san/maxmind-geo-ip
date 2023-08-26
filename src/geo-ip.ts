import maxmind, { CityResponse } from 'maxmind';
import * as cron from 'cron';
import * as fs from 'fs';
import { Reader } from 'mmdb-lib';
import { bold } from 'af-color';
import { exitOnError, echo, echoError } from './utils';
import {
  downloadCityDb, getDbRevision, getDbPath,
  MAX_ITEMS_IN_CACHE_DEFAULT, getLastDbRevision,
  getReader, revisionString, getDbDir, DB_DIR_DEFAULT, revisionDate,
} from './geo-ip-utils';
import { IGeoIP, CityResponseEx, IMaxMindOptions } from './interfaces';

export const geoIP: IGeoIP = {
  reader: undefined,
  setReader (reader: Reader<CityResponse>) {
    const prevRevision = this.dbRevision;
    this.reader = reader;
    this.dbRevision = getDbRevision(reader);
    this.ready = true;
    const revDate = revisionDate(this.dbRevision);
    if (this.eventEmitter?.emit) {
      this.eventEmitter.emit('geo-ip-ready', revDate);
      if (prevRevision !== this.dbRevision) {
        this.eventEmitter.emit('geo-ip-change-revision', revDate);
      }
    }
  },
  lookup (ipAddress: string): CityResponse | null {
    return this.reader?.get(ipAddress) || null;
  },
  lookupEx (ipAddress: string, lang: string = 'en'): CityResponseEx | null {
    if (!ipAddress) {
      return null;
    }
    const g = this.lookup(ipAddress);
    if (!g) {
      return null;
    }
    const property = (p: string): string => g[p]?.names && (g[p].names[lang] || g[p].names.en);

    let subdivision: string | undefined;
    if (g.subdivisions?.length) {
      const sd = g.subdivisions[0];
      subdivision = sd?.names?.[lang] || sd?.names?.en;
    }

    return {
      continent: property('continent'),
      continentCode: g.continent?.code,
      country: property('country'),
      countryISOCode: g.country?.iso_code,
      city: property('city'),
      latitude: g.location?.latitude,
      longitude: g.location?.longitude,
      postalCode: g.postal?.code,
      subdivision,
    };
  },
  ready: false,
  checkReady () {
    if (!this.ready) {
      echoError(`${bold}Failed to initialize GeoIP-City DB`);
    }
  },
  dbRevision: 0,
  dbDir: DB_DIR_DEFAULT,
  transferOptions (options: IMaxMindOptions) {
    options.edition = 'City';
    this.dbDir = getDbDir(options.dbDir);
    if (options.eventEmitter?.emit) {
      this.eventEmitter = options.eventEmitter;
    }
  },
};

export const initCityDb = async (options: IMaxMindOptions): Promise<undefined | IGeoIP> => {
  geoIP.transferOptions(options);
  const { noExitOnError = false } = options;
  let reader: Reader<CityResponse> | undefined;
  const cityDbName = getDbPath(options);
  try {
    if (!fs.existsSync(cityDbName)) {
      if (!(await downloadCityDb(options))) {
        if (noExitOnError) {
          return;
        }
        geoIP.checkReady();
        process.exit(1);
      }
    }
    reader = await maxmind.open<CityResponse>(cityDbName, { cache: { max: options.maxItemsInCache || MAX_ITEMS_IN_CACHE_DEFAULT } });
  } catch (err: Error | any) {
    exitOnError(err.message || err, noExitOnError);
    return;
  }
  if (!reader?.metadata) {
    const errorMessage = `${bold}Failed to initialize GeoIP-City DB ${cityDbName}`;
    exitOnError(errorMessage, noExitOnError);
    return;
  }
  geoIP.setReader(reader);
  echo(`Initialized DB ${cityDbName} ${revisionString(geoIP.dbRevision)}`);
  return geoIP;
};

export const updateCityDb = async (options: IMaxMindOptions): Promise<number> => {
  geoIP.transferOptions(options);
  let reader: Reader<CityResponse> | undefined;
  const cityDbName = getDbPath(options);
  if (!geoIP.ready && !(await initCityDb(options))) {
    return -1;
  }

  try {
    const lastRevision = await getLastDbRevision(options);
    if (lastRevision - geoIP.dbRevision < 48) {
      echo(`DB up to date ${revisionString(geoIP.dbRevision)}`);
      return 0;
    }
    echo(`Newer DB found ${revisionString(lastRevision)}`);

    if (!(await downloadCityDb(options))) {
      return -1;
    }
    reader = await getReader(options);
  } catch (err: Error | any) {
    echoError(err);
    reader = undefined;
  }
  if (!reader?.metadata) {
    echoError(`Failed to initialize database ${cityDbName}`);
    return -1;
  }

  const oldRevision = geoIP.dbRevision;
  geoIP.setReader(reader);
  echo(`Updated DB ${revisionString(oldRevision)} -> ${revisionString(geoIP.dbRevision)}`);
  return 1;
};

const SCHEDULE_DEFAULT = '0 0 * * 3,6'; // At 00:00 on Wednesday and Saturday

export const startGeoIP = async (options: IMaxMindOptions): Promise<IGeoIP> => {
  await initCityDb(options);
  geoIP.checkReady();
  cron.job(options.updateSchedule || SCHEDULE_DEFAULT, async () => {
    await updateCityDb(options);
    geoIP.checkReady();
  }, null, true, 'GMT', undefined, false);
  // onComplete, start, timeZone, context, runOnInit
  return geoIP;
};
