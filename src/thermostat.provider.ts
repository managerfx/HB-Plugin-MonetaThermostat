import axios from 'axios';
import { API, Logger } from 'homebridge';
import { runInThisContext } from 'vm';
import { addMinutes as addToDate, getRandomInt } from './misc.fuctions';
import { FullBoResponse, Zone, ZoneMode } from './models/full_bo.response';
import { ThermostatPlatformConfig } from './models/thermostat-config';
import { TargetHeatingCoolingState } from './models/thermostat-enums';

export class ThermostatProvider {
  // private readonly Service: typeof Service = this.api.hap.Service;
  // private readonly Characteristic: typeof Characteristic =
  //   this.api.hap.Characteristic;

  private store: {
    expirationDate: Date | null;
    data: Partial<FullBoResponse> | null;
    pending: boolean;
  } = {
    expirationDate: null,
    data: null,
    pending: false,
  };

  private istanceName = getRandomInt(999999).toString();
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

  public async getFullState(refrash = false): Promise<Partial<FullBoResponse> | null> {
    if (!this.store.pending && (!this.store?.expirationDate || new Date() > this.store.expirationDate || refrash)) {
      try {
        this.store = { ...this.store, pending: true };
        this.log.info(`${this.istanceName} calling full_bo`);
        const response = await this.apiIstance.post<FullBoResponse>('sensors_data_request', {
          request_type: 'full_bo',
        });
        // const response = await this.slowRequestExample(3000, { data: FULL_BO_RESP });
        if (response?.data) {
          this.store = {
            expirationDate: addToDate(new Date(), 1, 'm'),
            data: response.data,
            pending: false,
          };
          this.log.error(`${this.istanceName} full_bo loaded`, this.store.expirationDate);
          return response.data;
        }
      } catch (error) {
        this.log.error(`${this.istanceName} error in full_bo`, error);
        this.store = { ...this.store, pending: false };
      }
    }
    return this.store.data;
  }

  public getCurrentZoneInfo(zoneId: string): Zone {
    return this.fullThemostatData()?.zones.find((zone) => zone.id === zoneId);
  }

  public fullThemostatData(): Partial<FullBoResponse> | undefined {
    this.getFullState(); // keep refrashed for next time
    return this.store?.data;
  }

  public async setTargetTemperature(zoneId: string, temperature: number): Promise<any> {
    const currentZone = this.getCurrentZoneInfo(zoneId);
    const requests = {
      request_type: 'post_bo_setpoint',
      unitCode: this.store?.data?.unitCode,
      category: this.store?.data?.category,
      zones: [
        {
          id: zoneId,
          mode: currentZone.mode,
          currentManualTemperature: temperature,
          ...(currentZone.mode === ZoneMode.Auto && {
            setpoints: [
              {
                type: 'present',
                temperature: temperature,
              },
            ],
          }),
        },
      ],
    };

    return this.apiIstance.post<FullBoResponse>('sensors_data_request', requests).then(({ data }) => {
      this.getFullState(true);
      this.log.info('setTargetTemperature', data);
    });
  }

  public async setTargetState(state: TargetHeatingCoolingState): Promise<any> {
    if (state !== TargetHeatingCoolingState.OFF) {
      return;
    }
    const requests = {
      request_type: 'post_bo_setpoint',
      unitCode: this.store?.data?.unitCode,
      category: this.store?.data?.category,
      zones: [
        {
          id: 1,
          mode: ZoneMode.Off,
        },
      ],
    };

    return this.apiIstance.post<FullBoResponse>('sensors_data_request', requests).then(({ data }) => {
      this.getFullState(true);
      this.log.info('setTargetState', data);
    });
  }

  private slowRequestExample<T>(timer: number, outValue: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, timer, outValue));
  }
}
