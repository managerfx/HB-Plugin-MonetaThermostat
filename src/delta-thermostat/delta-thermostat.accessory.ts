import { Service, PlatformAccessory } from 'homebridge';
import { Category, SetPointType, ZoneMode } from '../models/thermostat.model';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { filterStateByZoneId } from '../utility.fuctions';
import { BaseThermostatAccessory } from '../models/delta-thermostat-accessory-base-class';

export enum CurrentHeatingCoolingState {
  OFF,
  HEAT,
  COOL,
}

export enum TargetHeatingCoolingState {
  OFF,
  HEAT,
  COOL,
  AUTO,
}

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class DeltaThermostatPlatformAccessory extends BaseThermostatAccessory {
  constructor(
    protected readonly platform: DeltaThermostatPlatform,
    protected readonly accessory: PlatformAccessory,
    protected readonly provider: ThermostatProvider,
    protected readonly zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);

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

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.TargetTemperature)
      .setProps({
        maxValue: this.provider.cachedValue.limits.present_max_temp,
        minValue: this.provider.cachedValue?.limits.present_min_temp,
        minStep: this.provider.cachedValue?.limits.step_value,
      })
      .onGet(this.handleTargetTemperatureGet.bind(this))
      .onSet(this.handleTargetTemperatureSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
      .onGet(this.handleTemperatureDisplayUnitsGet.bind(this));
    // .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.CoolingThresholdTemperature)
      .setProps({
        maxValue: this.provider.cachedValue?.limits.present_max_temp,
        minValue: this.provider.cachedValue?.limits.present_min_temp,
        minStep: this.provider.cachedValue?.limits.step_value,
      })
      .onGet(this.handleCoolingThresholdTemperatureGet.bind(this))
      .onSet(this.handleCoolingThresholdTemperatureSet.bind(this));

    this.serviceAccessory
      .getCharacteristic(this.Characteristic.HeatingThresholdTemperature)
      .setProps({
        maxValue: this.provider.cachedValue?.limits.present_max_temp,
        minValue: this.provider.cachedValue?.limits.present_min_temp,
        minStep: this.provider.cachedValue?.limits.step_value,
      })
      .onGet(this.handleHeatingThresholdTemperatureGet.bind(this))
      .onSet(this.handleHeatingThresholdTemperatureSet.bind(this));
  }

  private async handleCoolingThresholdTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    return this.provider
      .getZoneById(this.zoneId)
      .then((state) => state?.setpoints.find((setpoint) => setpoint.type === SetPointType.Present)?.temperature);
  }

  private async handleCoolingThresholdTemperatureSet(): Promise<void> {
    this.log.debug('Triggered SET CoolingThresholdTemperature');
  }

  private async handleHeatingThresholdTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    return this.provider
      .getZoneById(this.zoneId)
      .then((state) => state?.setpoints.find((setpoint) => setpoint.type === SetPointType.Absent)?.temperature);
  }

  private async handleHeatingThresholdTemperatureSet(): Promise<void> {
    this.log.debug('Triggered SET HeatingThresholdTemperature');
  }

  /**
   * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
   */
  private async handleCurrentHeatingCoolingStateGet(): Promise<CurrentHeatingCoolingState> {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');
    return this.getCurrentState();
  }

  /**
   * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
   */
  private async handleTargetHeatingCoolingStateGet(): Promise<TargetHeatingCoolingState> {
    this.log.debug('Triggered GET TargetHeatingCoolingState');
    return this.provider.getZoneById(this.zoneId).then((state) => {
      const category = this.provider.cachedValue?.category;

      return Object.keys(CONFIG_TARGET_STATE).find(
        (key) => <TergetStateFn>CONFIG_TARGET_STATE[key](state.mode, category)
      ) as unknown as TargetHeatingCoolingState;
    });
  }

  /**
   * Handle requests to set the 'Target Heating Cooling State' characteristic
   */
  private async handleTargetHeatingCoolingStateSet(value: TargetHeatingCoolingState): Promise<void> {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
    return this.provider.setTargetState(value).then(() => undefined);
  }

  /**
   * Handle requests to get the current value of the "Current Temperature" characteristic
   */
  private async handleCurrentTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET CurrentTemperature');
    // set this to a valid value for CurrentTemperature

    return this.provider.getZoneById(this.zoneId).then((state) => state?.temperature);
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  private async handleTargetTemperatureGet(): Promise<number> {
    this.log.debug('Triggered GET TargetTemperature');
    // set this to a valid value for TargetTemperature
    return this.provider.getZoneById(this.zoneId).then((state) => state?.effectiveSetpoint);
  }

  /**
   * Handle requests to set the "Target Temperature" characteristic
   */
  private handleTargetTemperatureSet(value: number): void {
    this.log.debug('Triggered SET TargetTemperature:', value);
    // this.provider.setTargetTemperature(this.zoneId, value);
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

  private async getCurrentState(): Promise<CurrentHeatingCoolingState> {
    const currentZone = await this.provider.getState().then(filterStateByZoneId(this.zoneId));

    if (currentZone?.mode === ZoneMode.Off) {
      return CurrentHeatingCoolingState.OFF;
    }
    if (this.provider.cachedValue?.category === Category.Heating) {
      if (currentZone?.temperature < currentZone?.effectiveSetpoint) {
        return CurrentHeatingCoolingState.HEAT;
      }
      return CurrentHeatingCoolingState.OFF;
    } else {
      if (currentZone?.temperature > currentZone?.effectiveSetpoint) {
        return CurrentHeatingCoolingState.COOL;
      }
      return CurrentHeatingCoolingState.OFF;
    }
  }
}

type TergetStateFn = (...params: unknown[]) => boolean;
const CONFIG_TARGET_STATE: {
  [key in TargetHeatingCoolingState]: TergetStateFn;
} = {
  [TargetHeatingCoolingState.OFF]: (mode: ZoneMode) => mode === ZoneMode.Off,
  [TargetHeatingCoolingState.AUTO]: (mode: ZoneMode) =>
    [ZoneMode.Auto, ZoneMode.Holiday, ZoneMode.Party].includes(mode),
  [TargetHeatingCoolingState.HEAT]: (mode: ZoneMode, currentCategory: Category) =>
    mode === ZoneMode.Manual && currentCategory === Category.Heating,
  [TargetHeatingCoolingState.COOL]: (mode: ZoneMode, currentCategory: Category) =>
    mode === ZoneMode.Manual && currentCategory !== Category.Heating,
};
