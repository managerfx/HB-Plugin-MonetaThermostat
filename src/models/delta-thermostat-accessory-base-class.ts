import { PlatformAccessory, Service } from 'homebridge';
import { DeltaThermostatPlatform } from '../delta-thermostat/delta.platform';
import { ThermostatProvider } from '../thermostat.api-provider';

export class BaseThermostatAccessory {
  protected serviceAccessory: Service;
  protected readonly Characteristic = this.platform.Characteristic;
  protected readonly Service = this.platform.Service;
  protected readonly log = this.platform.log;

  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId?: string
  ) {
    // set accessory information
    this.accessory
      .getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Delta Controls')
      .setCharacteristic(this.Characteristic.Model, 'eZNT-T100')
      .setCharacteristic(this.Characteristic.SerialNumber, 'Overlay 045');
  }
}
