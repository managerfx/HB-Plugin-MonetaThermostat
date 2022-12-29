import {
  Characteristic,
  CharacteristicProps,
  PartialAllowingNull,
  PlatformAccessory,
  Service,
  WithUUID,
} from 'homebridge';
import { DeltaThermostatPlatform } from '../delta-thermostat/delta.platform';
import { ThermostatProvider } from '../api/thermostat.api-provider';

export class BaseThermostatAccessory {
  protected serviceAccessory: Service;
  protected readonly Characteristic = this.platform.Characteristic;
  protected readonly Service = this.platform.Service;
  protected readonly log = this.platform.log;

  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[];
  private SERVICE_TYPE: typeof Service;

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

  setServiceType(serviceType: typeof Service) {
    this.SERVICE_TYPE = serviceType;
    this.serviceAccessory =
      this.accessory.getService(<WithUUID<typeof Service>>this.SERVICE_TYPE) ||
      this.accessory.addService(this.SERVICE_TYPE as any, this.accessory.displayName);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.serviceAccessory.setCharacteristic(
      this.Characteristic.Name,
      this.accessory.context.device.exampleDisplayName || this.accessory.displayName
    );
  }

  initCharacteristicHandlers(config?: CharacteristicHandlerMapItem[]) {
    if (config) {
      this.CHARACTERISTIC_HANDLER_CONFIG = config;
    }

    (this.CHARACTERISTIC_HANDLER_CONFIG || []).forEach((current) => {
      const characteristic = this.serviceAccessory.getCharacteristic(current.characteristic);

      if (current?.props) {
        this.log.debug(current.characteristic.name, current.props);
        characteristic.setProps(current?.props);
      }
      if (current?.getCallbackFn) {
        characteristic.onGet(current.getCallbackFn.bind(this));
      }
      if (current?.setCallbackFn) {
        characteristic.onSet(current.getCallbackFn.bind(this));
      }
    });
  }
}

export type CharacteristicHandlerMapItem = {
  characteristic: WithUUID<{
    new (): Characteristic;
  }>;
  getCallbackFn: () => string | number | Promise<string> | Promise<number>;
  setCallbackFn?: (args: unknown) => void;
  props?: PartialAllowingNull<CharacteristicProps>;
};
