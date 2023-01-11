import { PlatformAccessory } from 'homebridge';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { BaseThermostatAccessory, CharacteristicHandlerMapItem } from './base-thermostat.accessory';

enum OccupancyDetected {
  OCCUPANCY_NOT_DETECTED,
  OCCUPANCY_DETECTED,
}

export class DeltaPresencePlatformAccessory extends BaseThermostatAccessory {
  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[] = [
    {
      characteristic: this.Characteristic.OccupancyDetected,
      getFn: this.handleOccupancyDetectedGet,
    },
  ];

  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);

    super.setServiceType(this.Service.OccupancySensor);
    this.initCharacteristicHandlers();
  }

  private handleOccupancyDetectedGet(): OccupancyDetected {
    this.log.debug('Triggered GET CurrentTemperature');
    return this.provider.getThermostatPresence()
      ? OccupancyDetected.OCCUPANCY_DETECTED
      : OccupancyDetected.OCCUPANCY_NOT_DETECTED;
  }
}
