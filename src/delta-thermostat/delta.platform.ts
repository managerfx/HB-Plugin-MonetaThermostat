import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';
import { DELTA_PLATFORM_NAME, PLUGIN_NAME } from '../settings';
import { DeltaThermostatPlatformAccessory } from './delta-thermostat.accessory';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { ThermostatPlatformConfig } from '../models/thermostat.config';
import { DeltaPresencePlatformAccessory } from './delta-presence.accessory';
import { BaseThermostatAccessory } from '../models/delta-thermostat-accessory-base-class';
import { DeltaTemperatureSensorAccessory } from './delta-temperature-sensor.accessory';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class DeltaThermostatPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];
  private provider: ThermostatProvider;
  constructor(public readonly log: Logger, public readonly config: ThermostatPlatformConfig, public readonly api: API) {
    this.provider = new ThermostatProvider(log, config);
    this.log.info('Finished initializing platform:', this.config.name);
    this.log.debug('Plugin configuration', this.config);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  async discoverDevices() {
    const response = await this.provider.getState();
    if (!response?.zones) {
      this.log.error('No zones founded');
      return;
    }
    // A real plugin you would discover accessories from the local network, cloud services
    // or a user-defined array in the platform config.
    const devices: Device[] = response.zones.map((zone, index) => ({
      zoneId: zone.id,
      uniqueId: `${DELTA_PLATFORM_NAME}_${zone.id}`,
      displayName: (this.config?.zonesNames || [])[index] || `zone_${zone.id}`,
      istance: DeltaThermostatPlatformAccessory,
    }));
    devices.push({
      uniqueId: `${DELTA_PLATFORM_NAME}_at_home`,
      displayName: 'Thermostat Presence',
      istance: DeltaPresencePlatformAccessory,
    });
    devices.push({
      uniqueId: `${DELTA_PLATFORM_NAME}_external_temperature`,
      displayName: 'External Temperature Sensor',
      istance: DeltaTemperatureSensorAccessory,
    });

    // loop over the discovered devices and register each one if it has not already been registered
    for (const device of devices) {
      // generate a unique id for the accessory this should be generated from
      // something globally unique, but constant, for example, the device serial
      // number or MAC address
      const uuid = this.api.hap.uuid.generate(device.uniqueId);

      // see if an accessory with the same uuid has already been registered and restored from
      // the cached devices we stored in the `configureAccessory` method above
      const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);

      if (existingAccessory) {
        // the accessory already exists
        this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

        // if you need to update the accessory.context then you should run `api.updatePlatformAccessories`. eg.:
        // existingAccessory.context.device = device;
        // this.api.updatePlatformAccessories([existingAccessory]);

        // create the accessory handler for the restored accessory
        // this is imported from `platformAccessory.ts`

        new device.istance(this, existingAccessory, this.provider, device.zoneId);
        // new DeltaThermostatPlatformAccessory(this, existingAccessory, this.provider, device.zoneId);

        // it is possible to remove platform accessories at any time using `api.unregisterPlatformAccessories`, eg.:
        // remove platform accessories when no longer present
        // this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
        // this.log.info('Removing existing accessory from cache:', existingAccessory.displayName);
      } else {
        // the accessory does not yet exist, so we need to create it
        this.log.info('Adding new accessory:', device.displayName);

        // create a new accessory
        const accessory = new this.api.platformAccessory(device.displayName, uuid);

        // store a copy of the device object in the `accessory.context`
        // the `context` property can be used to store any data about the accessory you may need
        accessory.context.device = device;

        // create the accessory handler for the newly create accessory
        // this is imported from `platformAccessory.ts`
        // new DeltaThermostatPlatformAccessory(this, accessory, this.provider, device.zoneId);
        new device.istance(this, accessory, this.provider, device.zoneId);

        // link the accessory to your platform
        this.api.registerPlatformAccessories(PLUGIN_NAME, DELTA_PLATFORM_NAME, [accessory]);
      }
    }
  }
}

type Device = {
  zoneId?: string;
  uniqueId: string;
  displayName: string;
  istance: typeof BaseThermostatAccessory;
};
