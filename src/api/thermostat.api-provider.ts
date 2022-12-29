import axios from 'axios';
import { API, Logger } from 'homebridge';
import { addTime as addToDate, filterStateByZoneId, Subset } from '../utility.fuctions';
import { ThermostatModel, RequestType, Zone, ZoneMode, SetPointType } from '../models/thermostat.model';
import { ThermostatPlatformConfig } from '../models/thermostat.config';
import { TargetHeatingCoolingState } from '../delta-thermostat/delta-thermostat.accessory';
import EventEmitter from 'events';

export type ThermostaState = {
  expirationDate: Date | null;
  data: Partial<ThermostatModel> | null;
  pending: boolean;
};

export class ThermostatProvider {
  private store: ThermostaState = {
    expirationDate: null,
    data: null,
    pending: false,
  };

  readonly TARGET_STATE_MAP: {
    [key in TargetHeatingCoolingState]: () => Promise<void | unknown>;
  } = {
    [TargetHeatingCoolingState.AUTO]: this.setAutoTargetState.bind(this),
    [TargetHeatingCoolingState.COOL]: () => new Promise(() => null),
    [TargetHeatingCoolingState.HEAT]: () => new Promise(() => null),
    [TargetHeatingCoolingState.OFF]: this.setOffTargetState.bind(this),
  };

  readonly DEFAULT_ZONE_ID = '1';
  readonly thermostatEmitter = new EventEmitter();

  private apiIstance = axios.create({
    method: 'POST',
    baseURL: 'https://portal.planetsmartcity.com/api/v3/',
    headers: {
      Authorization: `Bearer ${this.config?.access_token}`,
      'x-planet-source': 'mobile',
      'timezone-offset': '-60',
    },
  });

  constructor(
    public readonly log: Logger,
    public readonly config?: ThermostatPlatformConfig,
    public readonly api?: API
  ) {}

  private get cachedValue(): Partial<ThermostatModel> {
    return this.store?.data;
  }

  private setCacheInvalid(): void {
    this.store = {
      ...this.store,
      expirationDate: new Date(),
    };
    this.log.debug('Cache invalidated');
  }

  private async thermostatApi(requestType: RequestType, request?: Subset<ThermostatModel>): Promise<ThermostatModel> {
    const composedRequest = {
      ...request,
      request_type: requestType,
    };
    this.log.debug('Thermostat API - REQUEST:', composedRequest);
    return this.apiIstance
      .post<ThermostatModel>('sensors_data_request', composedRequest)
      .then((response) => {
        this.log.debug(`Thermostat API - RESPONSE: STATUS ${response?.status}`, response?.data);

        requestType !== RequestType.Full && this.setCacheInvalid();
        return response?.data;
      })
      .catch((err) => {
        this.log.error('Error calling thermostat API', err);
        throw new Error(err);
      });
  }

  public async getState(): Promise<Partial<ThermostatModel> | null> {
    if (!this.store.pending && (!this.store?.expirationDate || new Date() > this.store.expirationDate)) {
      try {
        const timeStart = Date.now();
        this.log.info('Fetching thermostat State...');
        this.store = { ...this.store, pending: true };
        const response = await this.thermostatApi(RequestType.Full);
        if (response) {
          this.store = {
            expirationDate: addToDate(new Date(), this.config?.thermostatPollingInterval || 10, 's'),
            data: response,
            pending: false,
          };
          this.log.info(
            `Thermostat State fatched in ${Date.now() - timeStart} ms. Response is now cached until`,
            this.store.expirationDate.toLocaleTimeString()
          );
          this.thermostatEmitter.emit(RequestType.Full);

          return response;
        }
      } catch (error) {
        this.store = { ...this.store, pending: false };
      }
    }
    return this.store.data;
  }

  getCurrentState(): Partial<ThermostatModel> | null {
    this.getState(); //trigger update
    return this.cachedValue;
  }

  public getZoneById(zoneId: string): Zone {
    return filterStateByZoneId(zoneId)(this.getCurrentState());
  }

  // public async setTargetTemperature(zoneId: string, temperature: number): Promise<unknown> {
  //   return;
  //   // const currentZone = this.getCurrentZoneInfo(zoneId);
  //   // const requests = {
  //   //   request_type: 'post_bo_setpoint',
  //   //   unitCode: this.store?.data?.unitCode,
  //   //   category: this.store?.data?.category,
  //   //   zones: [
  //   //     {
  //   //       id: zoneId,
  //   //       mode: currentZone.mode,
  //   //       currentManualTemperature: temperature,
  //   //       ...(currentZone.mode === ZoneMode.Auto && {
  //   //         setpoints: [
  //   //           {
  //   //             type: 'present',
  //   //             temperature: temperature,
  //   //           },
  //   //         ],
  //   //       }),
  //   //     },
  //   //   ],
  //   // };

  //   // return this.apiIstance.post<FullBoResponse>('sensors_data_request', requests).then(({ data }) => {
  //   //   this.getFullState(true);
  //   //   this.log.info('setTargetTemperature', data);
  //   // });
  // }

  public async setTargetState(state: TargetHeatingCoolingState): Promise<boolean> {
    return this.TARGET_STATE_MAP[state]().then((response) => !!response);
  }

  private async setOffTargetState(): Promise<unknown> {
    const request: Subset<ThermostatModel> = {
      unitCode: this.store?.data?.unitCode,
      category: this.store?.data?.category,
      zones: [
        {
          id: this.DEFAULT_ZONE_ID,
          mode: ZoneMode.Off,
          expiration: 0,
          setpoints: [
            {
              type: SetPointType.Effective,
              temperature: this.store?.data?.zones?.[0].temperature + 1 || 19,
            },
          ],
        },
      ],
    };
    this.log.info('setOffTargetState');
    return this.thermostatApi(RequestType.Setpoint, request);
  }

  private async setAutoTargetState(): Promise<unknown> {
    const request: Subset<ThermostatModel> = {
      request_type: RequestType.Setpoint,
      unitCode: this.store?.data?.unitCode,
      category: this.store?.data?.category,
      zones: [
        {
          id: this.DEFAULT_ZONE_ID,
          mode: ZoneMode.Auto,
          expiration: 0,
        },
      ],
    };
    return this.thermostatApi(RequestType.Setpoint, request);
  }

  private slowRequestExample<T>(timer: number, outValue: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, timer, outValue));
  }

  public async setPresentAbsentTemperatureByZoneId(
    zoneId: string,
    presentTemperature?: number,
    absentTemperature?: number
  ): Promise<unknown> {
    const request: Subset<ThermostatModel> = {
      request_type: RequestType.Setpoint,
      unitCode: this.store?.data?.unitCode,
      category: this.store?.data?.category,
      zones: [
        {
          id: zoneId,
          setpoints: [
            {
              ...(presentTemperature && {
                type: SetPointType.Present,
                temperature: presentTemperature,
              }),
            },
            {
              ...(presentTemperature && {
                type: SetPointType.Absent,
                temperature: absentTemperature,
              }),
            },
          ],
        },
      ],
    };
    this.log.info('setPresentAbsentTemperatureByZoneId');
    return this.thermostatApi(RequestType.Setpoint, request);
  }

  public getThermostatPresence(): boolean {
    return this.getZoneById(this.DEFAULT_ZONE_ID).atHome;
  }
}

// const REQ_AUTO_SET_POINT = {
//   request_type: 'post_bo_setpoint',
//   unitCode: '1021_0A_00_090_00',
//   category: 'heating',
//   zones: [
//     {
//       id: '1',
//       setpoints: [
//         {
//           type: 'present',
//           temperature: 22,
//         },
//         {
//           type: 'absent',
//           temperature: 19,
//         },
//       ],
//     },
//     {
//       id: '2',
//       setpoints: [
//         {
//           type: 'present',
//           temperature: 20,
//         },
//         {
//           type: 'absent',
//           temperature: 19,
//         },
//       ],
//     },
//     {
//       id: '3',
//       setpoints: [
//         {
//           type: 'present',
//           temperature: 21.5,
//         },
//         {
//           type: 'absent',
//           temperature: 19,
//         },
//       ],
//     },
//   ],
// };

// const REQ_MANUAL_SET = {
//   request_type: 'post_bo_setpoint',
//   unitCode: '1021_0A_00_090_00',
//   category: 'heating',
//   zones: [
//     {
//       id: '1',
//       mode: 'manual',
//       currentManualTemperature: 19,
//       setpoints: [
//         {
//           type: 'effective',
//           temperature: 19,
//         },
//       ],
//     },
//   ],
// };

// const REQ_MANUAL_SET_TEMP = {
//   request_type: 'post_bo_setpoint',
//   unitCode: '1021_0A_00_090_00',
//   category: 'heating',
//   zones: [
//     {
//       id: '1',
//       currentManualTemperature: 19,
//       mode: 'manual',
//     },
//     {
//       id: '2',
//       currentManualTemperature: 20,
//       mode: 'manual',
//     },
//     {
//       id: '3',
//       currentManualTemperature: 22,
//       mode: 'manual',
//     },
//   ],
// };

// const REQ_OFF = {
//   request_type: 'post_bo_setpoint',
//   unitCode: '1021_0A_00_090_00',
//   category: 'heating',
//   zones: [
//     {
//       id: '1',
//       mode: 'off',
//       expiration: 0,
//       setpoints: [
//         {
//           type: 'effective',
//           temperature: 19,
//         },
//       ],
//     },
//   ],
// };
