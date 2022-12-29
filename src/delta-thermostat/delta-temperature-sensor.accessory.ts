import { PlatformAccessory } from 'homebridge';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { BaseThermostatAccessory } from '../models/delta-thermostat-accessory-base-class';

export class DeltaTemperatureSensorAccessory extends BaseThermostatAccessory {
  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);

    this.serviceAccessory =
      this.accessory.getService(this.Service.TemperatureSensor) ||
      this.accessory.addService(this.Service.TemperatureSensor, this.accessory.displayName);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.serviceAccessory.setCharacteristic(
      this.Characteristic.Name,
      accessory.context.device.exampleDisplayName || this.accessory.displayName
    );

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));
  }

  private handleCurrentTemperatureGet(): number {
    this.log.debug('Triggered GET OccupancyDetected');
    return this.provider.getCurrentState().externalTemperature;
  }
}
