import { ThermostatModel, Zone } from './models/thermostat.model';

export function addMinutes(date: Date, timeToAdd: number, type: 'm' | 's'): Date {
  const MULT_MAP = {
    s: 1000,
    m: 60000,
  };
  return new Date(date.getTime() + timeToAdd * MULT_MAP[type]);
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
