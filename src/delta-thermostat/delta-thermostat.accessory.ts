import { PlatformAccessory } from 'homebridge';
import { Category, RequestType, SetPointType, ZoneMode } from '../models/thermostat.model';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { filterStateByZoneId } from '../utility.fuctions';
import { BaseThermostatAccessory, CharacteristicHandlerMapItem } from '../models/delta-thermostat-accessory-base-class';

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

export class DeltaThermostatPlatformAccessory extends BaseThermostatAccessory {
  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[] = [
    {
      characteristic: this.Characteristic.CurrentHeatingCoolingState,
      getCallbackFn: this.handleCurrentHeatingCoolingStateGet,
    },
    {
      characteristic: this.Characteristic.TargetHeatingCoolingState,
      getCallbackFn: this.handleTargetHeatingCoolingStateGet,
      setCallbackFn: this.handleTargetHeatingCoolingStateSet,
    },
    {
      characteristic: this.Characteristic.CurrentTemperature,
      getCallbackFn: this.handleCurrentTemperatureGet,
    },
    {
      characteristic: this.Characteristic.TargetTemperature,
      getCallbackFn: this.handleTargetTemperatureGet,
      setCallbackFn: this.handleTargetTemperatureSet,
      props: {
        maxValue: this.provider.getCurrentState().limits.present_max_temp,
        minValue: this.provider.getCurrentState().limits.present_min_temp,
        minStep: this.provider.getCurrentState().limits.step_value,
      },
    },
    {
      characteristic: this.Characteristic.TemperatureDisplayUnits,
      getCallbackFn: this.handleTemperatureDisplayUnitsGet,
    },
    {
      characteristic: this.Characteristic.CoolingThresholdTemperature,
      getCallbackFn: this.handleCoolingThresholdTemperatureGet,
      setCallbackFn: this.handleCoolingThresholdTemperatureSet,
      props: {
        maxValue: this.provider.getCurrentState().limits.present_max_temp,
        minValue: this.provider.getCurrentState().limits.present_min_temp,
        minStep: this.provider.getCurrentState().limits.step_value,
      },
    },
    {
      characteristic: this.Characteristic.HeatingThresholdTemperature,
      getCallbackFn: this.handleHeatingThresholdTemperatureGet,
      setCallbackFn: this.handleHeatingThresholdTemperatureSet,
      props: {
        maxValue: this.provider.getCurrentState().limits.absent_max_temp,
        minValue: this.provider.getCurrentState().limits.absent_min_temp,
        minStep: this.provider.getCurrentState().limits.step_value,
      },
    },
  ];

  constructor(
    protected platform: DeltaThermostatPlatform,
    protected accessory: PlatformAccessory,
    protected provider: ThermostatProvider,
    protected zoneId: string
  ) {
    super(platform, accessory, provider, zoneId);
    super.setServiceType(this.Service.Thermostat);
    this.subscribeOnEvent();
    this.initCharacteristicHandlers();
  }

  private subscribeOnEvent() {
    this.provider.thermostatEmitter.on(RequestType.Full, () => {
      this.log.warn('nuovo dato scateno tutti i getter!!!');

      for (const current of this.CHARACTERISTIC_HANDLER_CONFIG) {
        if (current.getCallbackFn) {
          const characteristic = this.serviceAccessory.getCharacteristic(current.characteristic);
          const result = current.getCallbackFn.bind(this)();

          this.log.info(`updating ${current.characteristic.name} with value:`, result);
          characteristic.updateValue(result);
        }
      }
    });
  }

  private handleCoolingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET HeatingThresholdTemperature');

    const currentZone = this.provider.getZoneById(this.zoneId);
    const presentTemperature = currentZone.setpoints.find(
      (setpoint) => setpoint.type === SetPointType.Present
    )?.temperature;

    return presentTemperature > currentZone.effectiveSetpoint ? presentTemperature : currentZone.effectiveSetpoint;
  }

  private async handleCoolingThresholdTemperatureSet(): Promise<void> {
    this.log.debug('Triggered SET CoolingThresholdTemperature');
  }

  private handleHeatingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    return this.provider.getZoneById(this.zoneId)?.setpoints.find((setpoint) => setpoint.type === SetPointType.Absent)
      ?.temperature;
  }

  private async handleHeatingThresholdTemperatureSet(): Promise<void> {
    this.log.debug('Triggered SET HeatingThresholdTemperature');
  }

  /**
   * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
   */
  private handleCurrentHeatingCoolingStateGet(): CurrentHeatingCoolingState {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');
    return this.getCurrentState();
  }

  /**
   * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
   */
  private handleTargetHeatingCoolingStateGet(): TargetHeatingCoolingState {
    this.log.debug('Triggered GET TargetHeatingCoolingState');
    const zone = this.provider.getZoneById(this.zoneId);
    const category = this.provider.getCurrentState().category;

    return Object.keys(CONFIG_TARGET_STATE).find(
      (key) => <TergetStateFn>CONFIG_TARGET_STATE[key](zone.mode, category)
    ) as unknown as TargetHeatingCoolingState;
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
  private handleCurrentTemperatureGet(): number {
    this.log.debug('Triggered GET CurrentTemperature');
    // set this to a valid value for CurrentTemperature
    return this.provider.getZoneById(this.zoneId).temperature;
  }

  /**
   * Handle requests to get the current value of the "Target Temperature" characteristic
   */
  private handleTargetTemperatureGet(): number {
    this.log.debug('Triggered GET TargetTemperature');
    // set this to a valid value for TargetTemperature
    return this.provider.getZoneById(this.zoneId).effectiveSetpoint;
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

  private getCurrentState(): CurrentHeatingCoolingState {
    const currentState = this.provider.getCurrentState();
    const currentZone = filterStateByZoneId(this.zoneId)(currentState);

    if (currentZone?.mode === ZoneMode.Off) {
      return CurrentHeatingCoolingState.OFF;
    }
    if (currentState?.category === Category.Heating) {
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
