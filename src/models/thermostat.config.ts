import { PlatformConfig } from 'homebridge';

export interface ThermostatPlatformConfig extends PlatformConfig {
  accessToken: string;
  accessoryNames: string[];
  thermostatPollingInterval: number;
}
