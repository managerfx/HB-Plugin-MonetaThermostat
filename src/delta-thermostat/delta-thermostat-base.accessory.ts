import {
  Characteristic,
  CharacteristicProps,
  PartialAllowingNull,
  PlatformAccessory,
  Service,
  WithUUID,
} from 'homebridge';
import { DeltaThermostatPlatform } from './delta.platform';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { cloneDeep } from 'lodash';
import { RequestType } from '../models/thermostat.model';

export class BaseThermostatAccessory {
  protected serviceAccessory: Service;
  protected readonly Characteristic = this.platform.Characteristic;
  protected readonly Service = this.platform.Service;
  protected readonly log = cloneDeep(this.platform.log); // cloning to generetare new logger istance

  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[];
  private SERVICE_TYPE: typeof Service;

  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId?: string
  ) {
    Object.assign(this.log, { prefix: `${this.log.prefix} _${this.accessory.displayName}` });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.accessory.addService(<any>this.SERVICE_TYPE, this.accessory.displayName);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.serviceAccessory.setCharacteristic(
      this.Characteristic.Name,
      this.accessory.context.device.exampleDisplayName || this.accessory.displayName
    );
  }

  initCharacteristicHandlers(config?: CharacteristicHandlerMapItem[]) {
    this.subscribeOnNewThermostatDataEvent();
    if (config) {
      this.CHARACTERISTIC_HANDLER_CONFIG = config;
    }

    (this.CHARACTERISTIC_HANDLER_CONFIG || []).forEach((current) => {
      const characteristic = this.serviceAccessory.getCharacteristic(current.characteristic);

      if (current?.props) {
        this.log.debug(current.characteristic.name, current.props);
        characteristic.setProps(current?.props);
      }
      if (current?.getFn) {
        characteristic.onGet(current.getFn.bind(this));
      }
      if (current?.setFn) {
        characteristic.onSet(current.getFn.bind(this));
      }
    });
  }

  private subscribeOnNewThermostatDataEvent() {
    this.provider.thermostatEmitter.on(RequestType.Full, () => {
      this.log.info('New full_bo data retrieved! updating value...');

      for (const config of this.CHARACTERISTIC_HANDLER_CONFIG) {
        if (config.getFn) {
          const characteristic = this.serviceAccessory.getCharacteristic(config.characteristic);
          const newValue = config.getFn.bind(this)(); // calling handler function to caluculate new value

          this.log.debug(`Updating ${config.characteristic.name} with value:`, newValue);
          characteristic.updateValue(newValue);
        }
      }
    });
  }
}

export type CharacteristicHandlerMapItem = {
  characteristic: WithUUID<{
    new (): Characteristic;
  }>;
  getFn: () => string | number;
  setFn?: (args: unknown) => void;
  props?: PartialAllowingNull<CharacteristicProps>;
};
