import axios from 'axios';
import { API, Logger } from 'homebridge';
import { addMinutes as addToDate, getRandomInt } from './misc.fuctions';
import { FullBoResponse, Zone } from './models/full_bo.response';
import { ThermostatPlatformConfig } from './models/thermostat-config';

export class ThermostatProvider {
  // private readonly Service: typeof Service = this.api.hap.Service;
  // private readonly Characteristic: typeof Characteristic =
  //   this.api.hap.Characteristic;

  private store: {
    expirationDate: Date | null;
    data: Partial<FullBoResponse> | null;
    invalid?: boolean;
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

  public async getFullState(): Promise<Partial<FullBoResponse> | null> {
    if (
      !this.store.pending &&
      (!this.store?.expirationDate || new Date() > this.store.expirationDate || this.store.invalid)
    ) {
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

  private slowRequestExample<T>(timer: number, outValue: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, timer, outValue));
  }
}
