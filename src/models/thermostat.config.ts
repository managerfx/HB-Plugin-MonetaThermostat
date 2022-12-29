import { PlatformConfig } from 'homebridge';

export interface ThermostatPlatformConfig extends PlatformConfig {
  access_token: string;
  accessoryNames: string[];
}
