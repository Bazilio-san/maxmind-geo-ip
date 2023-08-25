/* eslint-disable no-console */
import { red, rs } from 'af-color';
import { padL } from 'af-tools-ts';

export const getHMS = (date?: Date) => {
  date = date || new Date();
  return `${padL(date.getUTCHours(), 2, '0')}:${padL(date.getUTCMinutes(), 2, '0')}:${padL(date.getUTCSeconds(), 2, '0')}`;
};

export const getYMD = (date?: Date) => {
  date = date || new Date();
  return `${padL(date.getUTCFullYear(), 2, '0')}-${padL(date.getUTCMonth() + 1, 2, '0')}-${padL(date.getUTCDate(), 2, '0')}`;
};

export const prefix = (): string => `[${getHMS()} - GeoIP]`;

export const echoError = (msg: any): void => {
  console.error(`${prefix()} ${red}${msg}${rs}`);
};

export const echo = (msg: any): void => {
  console.log(`${prefix()} ${msg}${rs}`);
};

export const exitOnError = (error: Error | any, noExitOnError?: boolean): void => {
  echoError(error.message || error);
  if (error.stack) {
    echoError(error.stack);
  }
  if (noExitOnError) {
    return;
  }
  process.exit(1);
};
