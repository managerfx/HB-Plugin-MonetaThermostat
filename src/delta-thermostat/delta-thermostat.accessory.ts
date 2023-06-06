import { PlatformAccessory } from 'homebridge';
import { SeasonName, SetPointType, ZoneMode } from '../models/thermostat.model';
import { ThermostatProvider } from '../api/thermostat.api-provider';
import { DeltaThermostatPlatform } from './delta.platform';
import { filterStateByZoneId } from '../utility.fuctions';
import { BaseThermostatAccessory, CharacteristicHandlerMapItem } from './base-thermostat.accessory';

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
export enum TemperatureDisplayUnits {
  CELSIUS,
  FAHRENHEIT,
}

export class DeltaThermostatPlatformAccessory extends BaseThermostatAccessory {
  CHARACTERISTIC_HANDLER_CONFIG: CharacteristicHandlerMapItem[] = [
    {
      characteristic: this.Characteristic.CurrentHeatingCoolingState,
      getFn: this.handleCurrentHeatingCoolingStateGet,
    },
    {
      characteristic: this.Characteristic.TargetHeatingCoolingState, // MANUAL mode. If season is Summer???
      getFn: this.handleTargetHeatingCoolingStateGet,
      setFn: this.handleTargetHeatingCoolingStateSet,
    },
    {
      characteristic: this.Characteristic.CurrentTemperature,
      getFn: this.handleCurrentTemperatureGet,
    },
    {
      characteristic: this.Characteristic.TargetTemperature, // MANUAL mode
      getFn: this.handleTargetTemperatureGet,
      setFn: this.handleTargetTemperatureSet,
      props: {
        maxValue: this.provider.getCurrentState().limits.present_max_temp,
        minValue: this.provider.getCurrentState().limits.present_min_temp,
        minStep: this.provider.getCurrentState().limits.step_value,
      },
    },
    {
      characteristic: this.Characteristic.TemperatureDisplayUnits,
      getFn: this.handleTemperatureDisplayUnitsGet,
    },
    {
      characteristic: this.Characteristic.CoolingThresholdTemperature,
      getFn: this.handleCoolingThresholdTemperatureGet,
      setFn: this.handleCoolingThresholdTemperatureSet,
      props: {
        maxValue: this.provider.getCurrentState().limits.present_max_temp,
        minValue: this.provider.getCurrentState().limits.present_min_temp,
        minStep: this.provider.getCurrentState().limits.step_value,
      },
    },
    {
      characteristic: this.Characteristic.HeatingThresholdTemperature, // AUTO mode MIN temperature value
      getFn: this.handleHeatingThresholdTemperatureGet,
      setFn: this.handleHeatingThresholdTemperatureSet,
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
    this.initCharacteristicHandlers();
  }

  private handleCoolingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET CoolingThresholdTemperature');

    const currentZone = this.provider.getZoneById(this.zoneId);
    const presentTemperature = this.provider.getSetPointTemperatureByZone(currentZone, SetPointType.Present);
    return presentTemperature > currentZone.effectiveSetpoint ? presentTemperature : currentZone.effectiveSetpoint;
  }

  private handleCoolingThresholdTemperatureSet(presentTemperature: number): void {
    this.log.debug('Triggered SET CoolingThresholdTemperature', presentTemperature || 'no val');
    this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, presentTemperature);
  }

  private handleHeatingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    return this.provider.getSetPointTemperatureByZone(this.provider.getZoneById(this.zoneId), SetPointType.Absent);
  }

  private handleHeatingThresholdTemperatureSet(absentTemperature: number): void {
    this.log.debug('Triggered SET HeatingThresholdTemperature', absentTemperature || 'no val');
    this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, null, absentTemperature);
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
    const season = this.provider.getCurrentState().season?.id;

    return Object.keys(CONFIG_TARGET_STATE).find(
      (key) => <TergetStateFn>CONFIG_TARGET_STATE[key](zone.mode, season)
    ) as unknown as TargetHeatingCoolingState;
  }

  /**
   * Handle requests to set the 'Target Heating Cooling State' characteristic
   */
  private handleTargetHeatingCoolingStateSet(value: TargetHeatingCoolingState): void {
    this.log.debug('Triggered SET TargetHeatingCoolingState:', value || 'no val');
    this.provider.setTargetState(value);
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
  private handleTargetTemperatureSet(manualTemperature: number): void {
    this.log.debug('Triggered SET TargetTemperature:', manualTemperature || 'no val');
    if (this.handleTargetHeatingCoolingStateGet() != TargetHeatingCoolingState.AUTO) {
      this.provider.setCurrentMananualTemperatureByZoneId(this.zoneId, manualTemperature);
    }
  }

  private handleTemperatureDisplayUnitsGet() {
    this.log.debug('Triggered GET TemperatureDisplayUnits');
    return TemperatureDisplayUnits.CELSIUS;
  }

  // private handleTemperatureDisplayUnitsSet(value: number) {
  //   this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
  // }

  private getCurrentState(): CurrentHeatingCoolingState {
    const currentState = this.provider.getCurrentState();
    const currentZone = filterStateByZoneId(this.zoneId)(currentState);

    if (currentZone?.mode === ZoneMode.Off) {
      return CurrentHeatingCoolingState.OFF;
    } else if (currentState?.season?.id === SeasonName.Winter) {
      return currentZone?.temperature < currentZone?.effectiveSetpoint
        ? CurrentHeatingCoolingState.HEAT
        : CurrentHeatingCoolingState.OFF;
    } else {
      return currentZone?.temperature > currentZone?.effectiveSetpoint
        ? CurrentHeatingCoolingState.COOL
        : CurrentHeatingCoolingState.OFF;
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
  [TargetHeatingCoolingState.HEAT]: (mode: ZoneMode, currentSeason: SeasonName) =>
    mode === ZoneMode.Manual && currentSeason === SeasonName.Winter,
  [TargetHeatingCoolingState.COOL]: (mode: ZoneMode, currentSeason: SeasonName) =>
    mode === ZoneMode.Manual && currentSeason === SeasonName.Summer,
};
