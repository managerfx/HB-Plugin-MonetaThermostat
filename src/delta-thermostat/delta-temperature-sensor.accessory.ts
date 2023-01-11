import { PlatformAccessory } from 'homebridge';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { BaseThermostatAccessory, CharacteristicHandlerMapItem } from './base-thermostat.accessory';

export class DeltaTemperatureSensorAccessory extends BaseThermostatAccessory {
  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[] = [
    {
      characteristic: this.Characteristic.CurrentTemperature,
      getFn: this.handleCurrentTemperatureGet,
    },
  ];

  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);
    super.setServiceType(this.Service.TemperatureSensor);
    this.initCharacteristicHandlers();
  }

  private handleCurrentTemperatureGet(): number {
    this.log.debug('Triggered GET OccupancyDetected');
    return this.provider.getCurrentState().externalTemperature;
  }
}
