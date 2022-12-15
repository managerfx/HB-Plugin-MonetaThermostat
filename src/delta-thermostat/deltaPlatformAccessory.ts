import { Service, PlatformAccessory, Characteristic, Logger } from 'homebridge';
import { Category, FullBoResponse, Zone, ZoneMode } from '../models/full_bo.response';
import { ThermostatProvider } from '../thermostat.provider';
import { DeltaThermostatPlatform } from './deltaPlatform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DeltaThermostatPlatformAccessory {
  private serviceAccessory: Service;
  private readonly Characteristic = this.platform.Characteristic;
  private readonly Service = this.platform.Service;
  private readonly log = this.platform.log;

  private get currentZoneData(): Zone {
    return this.provider.getCurrentZoneInfo(this.zoneId);
  }

  private get fullData(): FullBoResponse {
    return this.provider.fullThemostatData() as FullBoResponse;
  }

  constructor(
    private readonly platform: DeltaThermostatPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly provider: ThermostatProvider,
    private readonly zoneId: string
  ) {
    // set accessory information
    this.accessory
      .getService(this.Service.AccessoryInformation)!
      .setCharacteristic(this.Characteristic.Manufacturer, 'Delta Controls')
      .setCharacteristic(this.Characteristic.Model, 'eZNT-T100')
      .setCharacteristic(this.Characteristic.SerialNumber, 'Overlay 045');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.serviceAccessory =
      this.accessory.getService(this.Service.Thermostat) ||
      this.accessory.addService(this.Service.Thermostat, this.accessory.displayName);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.serviceAccessory.setCharacteristic(
      this.Characteristic.Name,
      accessory.context.device.exampleDisplayName || this.accessory.displayName
    );

    // each service must implement at-minimum the "required characteristics" for the given service type

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));
    this.Characteristic.TargetTemperature;

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.fullData.limits.present_max_temp,
        minValue: this.fullData.limits.present_min_temp,
        minStep: this.fullData.limits.step_value,
      })
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this));
    // .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
      .onGet(this.handleHeatingThresholdTemperatureGet.bind(this));
    // .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
  }

  private handleHeatingThresholdTemperatureGet() {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    // const limits = this.fullData?.manual_limits;
    return 18;
  }

  //   private handleHeatingThresholdTemperatureSet(value) {
  //     this.log.debug('Triggered SET HeatingThresholdTemperature');
  //   }

  /**
   * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
   */
  private async handleCurrentHeatingCoolingStateGet() {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');
    return this.getCurrentState();
  }

  /**
   * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
   */
  private async handleTargetHeatingCoolingStateGet() {
    this.log.debug('Triggered GET TargetHeatingCoolingState');
    // set this to a valid value for TargetHeatingCoolingState

    const currentZone = this.currentZoneData;
    if (currentZone?.mode === ZoneMode.Off) {
      return this.platform.Characteristic.TargetHeatingCoolingState.OFF;
    } else if ([ZoneMode.Auto, ZoneMode.Holiday, ZoneMode.Party].includes(currentZone?.mode)) {
      return this.platform.Characteristic.TargetHeatingCoolingState.AUTO;
    } else if (this.fullData?.category === Category.Heating) {
      return this.platform.Characteristic.TargetHeatingCoolingState.HEAT;
    } else {
      return this.platform.Characteristic.TargetHeatingCoolingState.COOL;
    }
  }

  /**
   * Handle requests to set the 'Target Heating Cooling State' characteristic
   */
  handleTargetHeatingCoolingStateSet(value: number) {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet() {
    this.log.debug('Triggered GET CurrentTemperature');
    // set this to a valid value for CurrentTemperature
    return this.currentZoneData?.temperature || -99;
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  private handleTargetTemperatureGet() {
    this.log.debug('Triggered GET TargetTemperature');
    // set this to a valid value for TargetTemperature
    return this.currentZoneData?.effectiveSetpoint || -99;
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  private handleTargetTemperatureSet(value: number) {
    this.log.debug('Triggered SET TargetTemperature:', value);
  }

  /**
   * Handle requests to get the current value of the 'Temperature Display Units' characteristic
   */
  private handleTemperatureDisplayUnitsGet() {
    this.log.debug('Triggered GET TemperatureDisplayUnits');
    // set this to a valid value for TemperatureDisplayUnits
    return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  /**
   * Handle requests to set the 'Temperature Display Units' characteristic
   */
  // private handleTemperatureDisplayUnitsSet(value: number) {
  //   this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
  // }

  private getCurrentState() {
    const currentZone = this.currentZoneData;
    if (currentZone?.mode !== ZoneMode.Off) {
      if (currentZone?.temperature < currentZone?.effectiveSetpoint) {
        return this.Characteristic.TargetHeatingCoolingState.HEAT;
      } else if (currentZone?.temperature > currentZone?.effectiveSetpoint) {
        return this.Characteristic.TargetHeatingCoolingState.COOL;
      }
    }
    return this.Characteristic.TargetHeatingCoolingState.OFF;
  }
}
