import { Service, PlatformAccessory } from 'homebridge';
import { SeasonName } from '../models/full_bo.response';
import { ExampleHomebridgePlatform } from '../platform';
import { ThermostatProvider } from '../thermostat.provider';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DeltaThermostatPlatformAccessory {
  private service: Service;
  //   private readonly COOLING_STATE_MAP = {
  //     [SeasonName.Summer]: this.platform.Characteristic.CurrentHeatingCoolingState.COOL,
  //     [SeasonName.Winter]: this.platform.Characteristic.CurrentHeatingCoolingState.HEAT,
  //     ['OFF']: this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
  //   };

  constructor(
    private readonly platform: ExampleHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly provider: ThermostatProvider,
    private readonly zoneId: string
  ) {
    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service =
      this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat, this.accessory.displayName, 'test');

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
      .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.handleCurrentTemperatureGet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.service
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
      .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));

    // this.service
    //   .getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
    //   .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
    //   .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
  }

  //   private handleHeatingThresholdTemperatureGet() {
  //     this.platform.log.debug('Triggered GET HeatingThresholdTemperature');
  //     const limits = this.provider.fullThemostatData?.manual_limits;

  //     // return {
  //     //   minValue: limits?.min_temp,
  //     //   maxValue: limits?.max_temp,
  //     //   minStep: limits?.step_value,
  //     // };
  //     return 25;
  //   }

  //   private handleHeatingThresholdTemperatureSet(value) {
  //     this.platform.log.debug('Triggered SET HeatingThresholdTemperature');
  //   }

  /**
   * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
   */
  private async handleCurrentHeatingCoolingStateGet() {
    this.platform.log.debug('Triggered GET CurrentHeatingCoolingState');
    // const status = this.COOLING_STATE_MAP[this.provider.thermostatState?.season?.id || 'OFF'];
    if (this.provider.getCurrentZoneInfo(this.zoneId)?.atHome) {
      return this.provider.fullThemostatData?.category === 'heating'
        ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
        : this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
    }
    return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
  }

  /**
   * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
   */
  private async handleTargetHeatingCoolingStateGet() {
    this.platform.log.debug('Triggered GET TargetHeatingCoolingState');
    // set this to a valid value for TargetHeatingCoolingState
    const currentZone = this.provider.getCurrentZoneInfo(this.zoneId);
    if (currentZone.atHome && currentZone.temperature < currentZone.effectiveSetpoint) {
      return this.provider.fullThemostatData?.category === 'heating'
        ? this.platform.Characteristic.CurrentHeatingCoolingState.HEAT
        : this.platform.Characteristic.CurrentHeatingCoolingState.COOL;
    }
    return this.platform.Characteristic.CurrentHeatingCoolingState.OFF;
  }

  /**
   * Handle requests to set the 'Target Heating Cooling State' characteristic
   */
  handleTargetHeatingCoolingStateSet(value: number) {
    this.platform.log.debug('Triggered SET TargetHeatingCoolingState:', value);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  handleCurrentTemperatureGet() {
    this.platform.log.debug('Triggered GET CurrentTemperature');
    // set this to a valid value for CurrentTemperature
    return this.provider.getCurrentZoneInfo(this.zoneId)?.temperature || 0;
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  private handleTargetTemperatureGet() {
    this.platform.log.debug('Triggered GET TargetTemperature');
    // set this to a valid value for TargetTemperature
    return this.provider.getCurrentZoneInfo(this.zoneId)?.effectiveSetpoint;
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  private handleTargetTemperatureSet(value: number) {
    this.platform.log.debug('Triggered SET TargetTemperature:', value);
  }

  /**
   * Handle requests to get the current value of the 'Temperature Display Units' characteristic
   */
  private handleTemperatureDisplayUnitsGet() {
    this.platform.log.debug('Triggered GET TemperatureDisplayUnits');
    // set this to a valid value for TemperatureDisplayUnits
    return this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS;
  }

  /**
   * Handle requests to set the 'Temperature Display Units' characteristic
   */
  private handleTemperatureDisplayUnitsSet(value: number) {
    this.platform.log.debug('Triggered SET TemperatureDisplayUnits:', value);
  }
}
