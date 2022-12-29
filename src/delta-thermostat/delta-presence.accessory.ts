import { PlatformAccessory } from 'homebridge';
import { ThermostatProvider } from '../thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { BaseThermostatAccessory } from '../models/delta-thermostat-accessory-base-class';

enum OccupancyDetected {
  OCCUPANCY_NOT_DETECTED,
  OCCUPANCY_DETECTED,
}

export class DeltaPresencePlatformAccessory extends BaseThermostatAccessory {
  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);

    this.serviceAccessory =
      this.accessory.getService(this.Service.OccupancySensor) ||
      this.accessory.addService(this.Service.OccupancySensor, this.accessory.displayName);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.serviceAccessory.setCharacteristic(
      this.Characteristic.Name,
      accessory.context.device.exampleDisplayName || this.accessory.displayName
    );

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.OccupancyDetected)
      .onGet(this.handleOccupancyDetectedGet.bind(this));
  }

  private async handleOccupancyDetectedGet(): Promise<OccupancyDetected> {
    this.log.debug('Triggered GET CurrentTemperature');
    return this.provider
      .getThermostatPresence()
      .then((isPresent) =>
        isPresent ? OccupancyDetected.OCCUPANCY_DETECTED : OccupancyDetected.OCCUPANCY_NOT_DETECTED
      );
  }
}
