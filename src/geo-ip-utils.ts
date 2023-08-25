import * as https from 'https';
import { Reader } from 'mmdb-lib';
import maxmind, { CityResponse } from 'maxmind';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as download from 'download';
import { Response } from 'mmdb-lib/lib/reader/response';
import { IMaxMindOptions, TEdition } from './interfaces';
import { echo, echoError, getYMD } from './utils';

const MILLIS_IN_HOUR = 3_600_000;
export const MAX_ITEMS_IN_CACHE_DEFAULT = 6000;
export const rootDir = process.cwd();
export const DB_DIR = path.join(rootDir, 'db');

export const getDbName = (edition?: TEdition) => `GeoLite2-${edition || 'City'}.mmdb`;

export const getDbPath = (edition?: TEdition) => path.join(DB_DIR, getDbName(edition));

export const getPermanentLink = (options: IMaxMindOptions, isSha?: boolean) => `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-${
  options.edition || 'City'}&license_key=${options.licenseKey}&suffix=tar.gz${isSha ? '.sha256' : ''}`;

/**
 * Возвращает метку времени в часах
 */
export const getDbRevision = (reader: Reader<any> | undefined): number => {
  const { buildEpoch: be } = reader?.metadata || {};
  return Math.floor((be ? +be : 0) / MILLIS_IN_HOUR);
};

export const revisionDate = (revision: number): string => `[v ${getYMD(new Date(revision * MILLIS_IN_HOUR))}]`;

/**
 * Возвращает метку времени в часах
 */
export const getLastDbRevision = (options: IMaxMindOptions): Promise<number> => {
  const url = getPermanentLink(options);
  return new Promise((resolve, reject) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      const fileName = (res.rawHeaders.find((_, index) => index && res.rawHeaders[index - 1].toLowerCase() === 'content-disposition')) || '';
      const re = /^.+_(\d\d\d\d)(\d\d)(\d\d)\..+$/;
      if (!re.test(fileName)) {
        return resolve(0);
      }
      const dd = new Date(fileName.replace(re, '$1-$2-$3'));
      resolve(Math.floor(+dd / MILLIS_IN_HOUR));
    }).on('error', reject).end();
  });
};

export const getReader = async <T extends Response = CityResponse> (options: IMaxMindOptions)
  : Promise<Reader<T>> => maxmind.open<T>(getDbPath(options.edition), { cache: { max: options.maxItemsInCache || MAX_ITEMS_IN_CACHE_DEFAULT } });

interface IDownloadResultItem {
  type: string,
  path: string
}

export const downloadCityDb = async (options: IMaxMindOptions): Promise<true | undefined> => {
  options.edition = 'City';
  const url = getPermanentLink(options);
  try {
    echo(`Downloading last City DB...`);
    const res = await download(url, DB_DIR, { extract: true, filename: getDbName(options.edition) });
    const relFilePath = (res as unknown as IDownloadResultItem[]).find((v) => v.type === 'file' && v.path.endsWith('.mmdb'))?.path;
    if (!relFilePath) {
      echoError(`Failed to download database ${url}`);
      return;
    }
    const srcDir = relFilePath.split(/[\\/]/)[0];
    if (!srcDir) {
      echoError(`Failed to get the path to the folder with the downloaded database ${url}`);
      return;
    }
    fse.moveSync(path.join(DB_DIR, relFilePath), getDbPath(options.edition), { overwrite: true });
    fse.removeSync(path.join(DB_DIR, srcDir));
  } catch (err) {
    echoError(err);
    return;
  }
  const reader = await getReader(options);
  echo(`Downloaded DB ${revisionDate(getDbRevision(reader))}`);
  return true;
};
