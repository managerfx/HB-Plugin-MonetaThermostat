import { ThermostatModel, Zone } from './models/thermostat.model';
const ADD_TIME_MULTIPLIER_MAP = {
  s: 1000,
  m: 60000,
};
export function addTime(date: Date, timeToAdd: number, type: 'm' | 's'): Date {
  return new Date(date.getTime() + timeToAdd * ADD_TIME_MULTIPLIER_MAP[type]);
}

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

export function filterStateByZoneId(zoneId: string): (value: Partial<ThermostatModel>) => Zone {
  return (state) => state?.zones?.find((zone) => zone.id === zoneId);
}

export type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
    ? Subset<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? Subset<K[attr]> | null | undefined
    : K[attr];
};
