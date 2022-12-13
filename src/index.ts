import { API } from 'homebridge';
import { DELTA_PLATFORM_NAME } from './settings';
import { DeltaThermostatPlatform } from './delta-thermostat/deltaPlatform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  // api.registerPlatform(PLATFORM_NAME, ExampleHomebridgePlatform);
  api.registerPlatform(DELTA_PLATFORM_NAME, DeltaThermostatPlatform);
  // api.registerAccessory(THERMOSTAT_NAME, ExampleThermostatAccessory);
};
