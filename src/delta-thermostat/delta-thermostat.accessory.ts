import { PlatformAccessory } from 'homebridge';
import { Category, SeasonName, SetPointType, ZoneMode } from '../models/thermostat.model';
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
      characteristic: this.Characteristic.TargetHeatingCoolingState,
      logDescription: 'select modalità',
      getFn: this.handleTargetHeatingCoolingStateGet,
      setFn: this.handleTargetHeatingCoolingStateSet,
      props: {
        validValues: VALID_TARGET_STATE_BY_CATEGORY_MAP[this.provider.getCurrentState().category],
      },
    },
    {
      characteristic: this.Characteristic.CurrentTemperature,
      getFn: this.handleCurrentTemperatureGet,
    },
    {
      characteristic: this.Characteristic.TargetTemperature,
      logDescription: 'mode MANUAL: temperatura che vuoi raggiungere in casa',
      getFn: this.handleTargetTemperatureGet,
      setFn: this.handleTargetTemperatureSet,
      props: {
        minValue: Math.min(
          this.provider.getCurrentState().limits.absent_min_temp,
          this.provider.getCurrentState().manual_limits.min_temp
        ),
        maxValue: Math.max(
          this.provider.getCurrentState().limits.absent_max_temp,
          this.provider.getCurrentState().manual_limits.max_temp
        ),
        minStep: this.provider.getCurrentState().manual_limits.step_value,
      },
    },
    {
      characteristic: this.Characteristic.TemperatureDisplayUnits,
      getFn: this.handleTemperatureDisplayUnitsGet,
    },
    {
      // Viene usato solo modalità AUTO. è la temperatura più ALTA che vuoi in casa
      characteristic: this.Characteristic.CoolingThresholdTemperature,
      logDescription: 'mode AUTO: temperatura più ALTA che vuoi in casa',
      getFn: this.handleCoolingThresholdTemperatureGet,
      setFn: this.handleCoolingThresholdTemperatureSet,
      // quando sono in modalità INVERNO la temperatura più ALTA in casa la voglio se sono Presente
      ...(this.provider.getCurrentState().category === Category.Heating && {
        props: {
          maxValue: this.provider.getCurrentState().limits.present_max_temp,
          minValue: this.provider.getCurrentState().limits.present_min_temp,
          minStep: this.provider.getCurrentState().limits.step_value,
        },
      }),
      // quando sono in modalità ESTATE la temperatura più ALTA in casa la voglio se sono Assente
      ...(this.provider.getCurrentState().category === Category.Cooling && {
        props: {
          maxValue: this.provider.getCurrentState().limits.absent_max_temp,
          minValue: this.provider.getCurrentState().limits.absent_min_temp,
          minStep: this.provider.getCurrentState().limits.step_value,
        },
      }),
    },
    {
      // Viene usato solo modalità AUTO. è la temperatura più BASSA che vuoi in casa
      characteristic: this.Characteristic.HeatingThresholdTemperature,
      logDescription: 'mode AUTO: temperatura più BASSA che vuoi in casa',
      getFn: this.handleHeatingThresholdTemperatureGet,
      setFn: this.handleHeatingThresholdTemperatureSet,
      // quando sono in modalità INVERNO la temperatura più BASSA in casa la voglio se sono Assente
      ...(this.provider.getCurrentState().category === Category.Heating && {
        props: {
          maxValue: this.provider.getCurrentState().limits.absent_max_temp,
          minValue: this.provider.getCurrentState().limits.absent_min_temp,
          minStep: this.provider.getCurrentState().limits.step_value,
        },
      }),
      // quando sono in modalità ESTATE la temperatura più BASSA in casa la voglio se sono Presente
      ...(this.provider.getCurrentState().category === Category.Cooling && {
        props: {
          maxValue: this.provider.getCurrentState().limits.present_max_temp,
          minValue: this.provider.getCurrentState().limits.present_min_temp,
          minStep: this.provider.getCurrentState().limits.step_value,
        },
      }),
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

  //Viene usato solo modalità AUTO. è la temperatura più ALTA che vuoi in casa
  private handleCoolingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET CoolingThresholdTemperature');
    const currentZone = this.provider.getZoneById(this.zoneId);
    if (this.provider.getCurrentState().category === Category.Heating) {
      const temperature = this.provider.getSetPointTemperatureByZone(currentZone, SetPointType.Present);
      return temperature > currentZone.effectiveSetpoint ? temperature : currentZone.effectiveSetpoint;
    }
    if (this.provider.getCurrentState().category === Category.Cooling) {
      const temperature = this.provider.getSetPointTemperatureByZone(currentZone, SetPointType.Absent);
      return temperature;
    }
  }

  // Viene usato solo modalità AUTO. è la temperatura più ALTA che vuoi in casa
  private handleCoolingThresholdTemperatureSet(maxTemperatureAtHome: number): void {
    this.log.debug('Triggered SET CoolingThresholdTemperature', maxTemperatureAtHome || 'no val');

    if (this.provider.getCurrentState().category === Category.Heating) {
      this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, maxTemperatureAtHome);
    }
    if (this.provider.getCurrentState().category === Category.Cooling) {
      this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, null, maxTemperatureAtHome);
    }
  }

  //Viene usato solo modalità AUTO. è la temperatura più BASSA che vuoi in casa
  private handleHeatingThresholdTemperatureGet(): number {
    this.log.debug('Triggered GET HeatingThresholdTemperature');
    if (this.provider.getCurrentState().category === Category.Heating) {
      return this.provider.getSetPointTemperatureByZone(this.provider.getZoneById(this.zoneId), SetPointType.Absent);
    }
    if (this.provider.getCurrentState().category === Category.Cooling) {
      return this.provider.getSetPointTemperatureByZone(this.provider.getZoneById(this.zoneId), SetPointType.Present);
    }
  }

  // Viene usato solo modalità AUTO. è la temperatura più BASSA che vuoi in casa
  private handleHeatingThresholdTemperatureSet(minTemperatureAtHome: number): void {
    this.log.debug('Triggered SET HeatingThresholdTemperature', minTemperatureAtHome || 'no val');
    if (this.provider.getCurrentState().category === Category.Heating) {
      this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, null, minTemperatureAtHome);
    }
    if (this.provider.getCurrentState().category === Category.Cooling) {
      this.provider.setPresentAbsentTemperatureByZoneId(this.zoneId, minTemperatureAtHome);
    }
  }

  /**
   * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
   */
  private handleCurrentHeatingCoolingStateGet(): CurrentHeatingCoolingState {
    this.log.debug('Triggered GET CurrentHeatingCoolingState');
    return this.getCurrentHeatingCoolingState();
  }

  /**
   * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
   */
  private handleTargetHeatingCoolingStateGet(): TargetHeatingCoolingState {
    this.log.debug('Triggered GET TargetHeatingCoolingState');
    const zone = this.provider.getZoneById(this.zoneId);
    const season = this.provider.getCurrentState().season?.id;

    return Object.keys(ZONE_MODE_TO_TARGET_STATE_MAP).find(
      (key) => <TergetStateFn>ZONE_MODE_TO_TARGET_STATE_MAP[key](zone.mode, season)
    ) as unknown as TargetHeatingCoolingState;
  }

  /**
   * Handle requests to set the 'Target Heating Cooling State' characteristic
   */
  private handleTargetHeatingCoolingStateSet(value: TargetHeatingCoolingState): void {
    this.log.error('Triggered SET TargetHeatingCoolingState:', value || 'no val');
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
      const limits = this.provider.getCurrentState().limits;
      const temperatoreInRange =
        manualTemperature >= limits.present_min_temp && manualTemperature <= limits.present_max_temp;

      this.provider.setCurrentMananualTemperatureByZoneId(
        this.zoneId,
        temperatoreInRange ? manualTemperature : limits.present_min_temp
      );
    }
  }

  private handleTemperatureDisplayUnitsGet() {
    this.log.debug('Triggered GET TemperatureDisplayUnits');
    return TemperatureDisplayUnits.CELSIUS;
  }

  // private handleTemperatureDisplayUnitsSet(value: number) {
  //   this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
  // }

  private getCurrentHeatingCoolingState(): CurrentHeatingCoolingState {
    const currentState = this.provider.getCurrentState();
    const currentZone = filterStateByZoneId(this.zoneId)(currentState);

    if (currentZone?.mode !== ZoneMode.Off && currentState?.category === Category.Heating && currentZone.atHome) {
      return CurrentHeatingCoolingState.HEAT;
    } else if (
      currentZone?.mode !== ZoneMode.Off &&
      currentState?.category === Category.Cooling &&
      currentZone.atHome
    ) {
      // in modalità ESTATE le ventole del raffrescamento sono sempre accese anche al minimo
      return CurrentHeatingCoolingState.COOL;
    }
    return CurrentHeatingCoolingState.OFF;
  }
}

type TergetStateFn = (...params: unknown[]) => boolean;
const ZONE_MODE_TO_TARGET_STATE_MAP: {
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

const VALID_TARGET_STATE_BY_CATEGORY_MAP: { [key in Category]: TargetHeatingCoolingState[] } = {
  [Category.Cooling]: [TargetHeatingCoolingState.COOL, TargetHeatingCoolingState.AUTO, TargetHeatingCoolingState.OFF],
  [Category.Heating]: [TargetHeatingCoolingState.HEAT, TargetHeatingCoolingState.AUTO, TargetHeatingCoolingState.OFF],
  [Category.Off]: [TargetHeatingCoolingState.OFF],
};
