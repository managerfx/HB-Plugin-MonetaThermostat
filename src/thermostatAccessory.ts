// import {
//   Service,
//   Logger,
//   API,
//   Characteristic,
//   AccessoryConfig,
//   AccessoryPlugin,
//   Controller,
//   ControllerServiceMap,
// } from 'homebridge';
// import { FullBoResponse, SeasonName } from './models/full_bo.response';
// import { ThermostatProvider } from './thermostat.provider';

// export class ExampleThermostatAccessory implements AccessoryPlugin {
//   private readonly Service: typeof Service = this.api.hap.Service;
//   private readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

//   private thermostatIstance: Service;
//   private latestState: Partial<FullBoResponse> = {};
//   private provider: ThermostatProvider;

//   private readonly COOLING_STATE_MAP = {
//     [SeasonName.Summer]: this.Characteristic.CurrentHeatingCoolingState.COOL,
//     [SeasonName.Winter]: this.Characteristic.CurrentHeatingCoolingState.HEAT,
//     ['OFF']: this.Characteristic.CurrentHeatingCoolingState.OFF,
//   };

//   constructor(private log: Logger, private readonly config: AccessoryConfig, private readonly api: API) {
//     this.provider = new Object() ;
//     // extract name from config
//     // const name = config.name;
//     const uuid = this.api.hap.uuid.generate('10838d27-45ab-405a-b1c5-42b2dc2391c1');
//     // create a new Thermostat service
//     this.thermostatIstance = new this.Service.Thermostat('DeltaMoneta', uuid);

//     // create handlers for required characteristics
//     this.thermostatIstance
//       .getCharacteristic(this.Characteristic.CurrentHeatingCoolingState)
//       .onGet(this.handleCurrentHeatingCoolingStateGet.bind(this));

//     this.thermostatIstance
//       .getCharacteristic(this.Characteristic.TargetHeatingCoolingState)
//       .onGet(this.handleTargetHeatingCoolingStateGet.bind(this))
//       .onSet(this.handleTargetHeatingCoolingStateSet.bind(this));

//     this.thermostatIstance
//       .getCharacteristic(this.Characteristic.CurrentTemperature)
//       .onGet(this.handleCurrentTemperatureGet.bind(this));

//     this.thermostatIstance
//       .getCharacteristic(this.Characteristic.TargetTemperature)
//       .onGet(this.handleTargetTemperatureGet.bind(this))
//       .onSet(this.handleTargetTemperatureSet.bind(this));

//     this.thermostatIstance
//       .getCharacteristic(this.Characteristic.TemperatureDisplayUnits)
//       .onGet(this.handleTemperatureDisplayUnitsGet.bind(this))
//       .onSet(this.handleTemperatureDisplayUnitsSet.bind(this));
//   }

//   identify?(): void {
//     this.log.info('inside identitfy');
//   }

//   getServices(): Service[] {
//     this.log.info('inside getServices');

//     const infoService = new this.Service.AccessoryInformation();
//     infoService.setCharacteristic(this.Characteristic.Manufacturer, 'SensMan');
//     return [infoService, this.thermostatIstance];
//   }

//   getControllers?(): Controller<ControllerServiceMap>[] {
//     this.log.info('inside getControllers');
//     return [];
//   }

//   /**
//    * Handle requests to get the current value of the 'Current Heating Cooling State' characteristic
//    */
//   async handleCurrentHeatingCoolingStateGet() {
//     this.log.debug('Triggered GET CurrentHeatingCoolingState');
//     await this.setFullBoRequest();
//     const status = this.COOLING_STATE_MAP[this.latestState?.season?.id || 'OFF'];
//     return status;
//   }

//   /**
//    * Handle requests to get the current value of the 'Target Heating Cooling State' characteristic
//    */
//   async handleTargetHeatingCoolingStateGet() {
//     this.log.debug('Triggered GET TargetHeatingCoolingState');

//     // set this to a valid value for TargetHeatingCoolingState
//     await this.setFullBoRequest();

//     const status = this.COOLING_STATE_MAP[this.latestState?.season?.id || 'OFF'];
//     return status;
//   }

//   /**
//    * Handle requests to set the 'Target Heating Cooling State' characteristic
//    */
//   handleTargetHeatingCoolingStateSet(value) {
//     this.log.debug('Triggered SET TargetHeatingCoolingState:', value);
//   }

//   /**
//    * Handle requests to get the current value of the "Current Temperature" characteristic
//    */
//   handleCurrentTemperatureGet() {
//     this.log.debug('Triggered GET CurrentTemperature');

//     // set this to a valid value for CurrentTemperature

//     const currentValue = (this.latestState?.zones || [])[0]?.temperature;
//     return currentValue || 0;
//   }

//   /**
//    * Handle requests to get the current value of the "Target Temperature" characteristic
//    */
//   handleTargetTemperatureGet() {
//     this.log.debug('Triggered GET TargetTemperature');

//     // set this to a valid value for TargetTemperature
//     const currentValue = 10;

//     return currentValue;
//   }

//   /**
//    * Handle requests to set the "Target Temperature" characteristic
//    */
//   handleTargetTemperatureSet(value) {
//     this.log.debug('Triggered SET TargetTemperature:', value);
//   }

//   /**
//    * Handle requests to get the current value of the 'Temperature Display Units' characteristic
//    */
//   handleTemperatureDisplayUnitsGet() {
//     this.log.debug('Triggered GET TemperatureDisplayUnits');

//     // set this to a valid value for TemperatureDisplayUnits
//     const currentValue = this.Characteristic.TemperatureDisplayUnits.CELSIUS;

//     return currentValue;
//   }

//   /**
//    * Handle requests to set the 'Temperature Display Units' characteristic
//    */
//   handleTemperatureDisplayUnitsSet(value) {
//     this.log.debug('Triggered SET TemperatureDisplayUnits:', value);
//   }

//   async setFullBoRequest(): Promise<Partial<FullBoResponse> | null> {
//     if (this.latestState?.provider) {
//       return this.latestState;
//     }

//     const response = await this.provider.getFullState();
//     if (response) {
//       this.log.debug('full_bo reponse:', response);
//       this.latestState = response;
//       return this.latestState;
//     }
//     return null;
//   }
// }
