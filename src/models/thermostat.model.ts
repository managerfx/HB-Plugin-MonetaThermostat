export interface Season {
  id: SeasonName;
  limits?: any;
}

export interface Setpoint {
  type: SetPointType;
  temperature: number;
}

export interface Schedule {
  day: string;
  bands: any[];
}

export interface Calendar {
  step: number;
  schedule: Schedule[];
}

export interface Zone {
  id: string;
  temperature: number;
  humidity?: any;
  atHome: boolean;
  atHomeForScheduler: boolean;
  blockHumidity: boolean;
  effectiveSetpoint: number;
  setpoints: Setpoint[];
  mode: ZoneMode;
  setpointSelected: SetPointType;
  expiration?: any;
  currentManualTemperature: number;
  dateExpiration?: any;
  calendar: Calendar;
}

export interface Limits {
  steps: number;
  step_value: number;
  present_max_temp: number;
  present_min_temp: number;
  absent_max_temp: number;
  absent_min_temp: number;
  present_is_unique: boolean;
  absent_is_unique: boolean;
}

export interface ManualLimits {
  min_temp: number;
  max_temp: number;
  steps: number;
  step_value: number;
}

export interface ThermostatModel {
  request_type?: RequestType;
  provider: string;
  unitCode: string;
  measureUnit: string;
  externalTemperature: number;
  category: Category;
  season: Season;
  zones: Zone[];
  limits: Limits;
  manual_limits: ManualLimits;
  check_first_time: boolean;
  set_manual_expiration: boolean;
  manual_multizona: boolean;
  setpoints_minutes: string[];
  same_mode_for_all_zones: boolean;
  modal_expiration: boolean;
}

export enum RequestType {
  Full = 'full_bo',
  Setpoint = 'post_bo_setpoint',
}

export enum Category {
  Heating = 'heating', // inverno, riscaldamento disponibile
  Cooling = 'cooling', // estate, raffrescamento disponibile
  Off = 'off', // riescaldamento / raffrescamento non disponibile
}

export enum SeasonName {
  Winter = 'winter',
  Summer = 'summer',
}

export enum SetPointType {
  Absent = 'absent',
  Present = 'present',
  Effective = 'effective', //Manual
}

export enum ZoneMode {
  Auto = 'auto',
  Off = 'off',
  Manual = 'manual', //Permanente
  Party = 'party',
  Holiday = 'holiday',
}
