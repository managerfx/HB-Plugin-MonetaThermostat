export const FULL_BO_RESP_HEATING = {
  provider: 'A2A',
  unitCode: '1021_0A_00_090_00',
  measureUnit: '°C',
  externalTemperature: 4.74,
  category: 'heating',
  season: {
    id: 'winter',
    limits: null,
  },
  zones: [
    {
      id: '1',
      temperature: 20.18,
      humidity: null,
      atHome: false,
      atHomeForScheduler: false,
      blockHumidity: false,
      effectiveSetpoint: 19,
      setpoints: [
        {
          type: 'present',
          temperature: 22,
        },
        {
          type: 'absent',
          temperature: 19,
        },
      ],
      mode: 'auto',
      setpointSelected: 'absent',
      expiration: null,
      currentManualTemperature: 22,
      dateExpiration: null,
      calendar: {
        step: 30,
        schedule: [
          {
            day: 'MON',
            bands: [],
          },
          {
            day: 'TUE',
            bands: [],
          },
          {
            day: 'WED',
            bands: [],
          },
          {
            day: 'THU',
            bands: [],
          },
          {
            day: 'FRI',
            bands: [],
          },
          {
            day: 'SAT',
            bands: [],
          },
          {
            day: 'SUN',
            bands: [],
          },
        ],
      },
    },
    {
      id: '2',
      temperature: 19.81,
      humidity: null,
      atHome: false,
      atHomeForScheduler: false,
      blockHumidity: false,
      effectiveSetpoint: 19,
      setpoints: [
        {
          type: 'present',
          temperature: 21,
        },
        {
          type: 'absent',
          temperature: 19,
        },
      ],
      mode: 'auto',
      setpointSelected: 'absent',
      expiration: null,
      currentManualTemperature: 21,
      dateExpiration: null,
      calendar: {
        step: 30,
        schedule: [
          {
            day: 'MON',
            bands: [],
          },
          {
            day: 'TUE',
            bands: [],
          },
          {
            day: 'WED',
            bands: [],
          },
          {
            day: 'THU',
            bands: [],
          },
          {
            day: 'FRI',
            bands: [],
          },
          {
            day: 'SAT',
            bands: [],
          },
          {
            day: 'SUN',
            bands: [],
          },
        ],
      },
    },
    {
      id: '3',
      temperature: 19.6,
      humidity: null,
      atHome: false,
      atHomeForScheduler: false,
      blockHumidity: false,
      effectiveSetpoint: 19,
      setpoints: [
        {
          type: 'present',
          temperature: 21,
        },
        {
          type: 'absent',
          temperature: 19,
        },
      ],
      mode: 'auto',
      setpointSelected: 'absent',
      expiration: null,
      currentManualTemperature: 21,
      dateExpiration: null,
      calendar: {
        step: 30,
        schedule: [
          {
            day: 'MON',
            bands: [],
          },
          {
            day: 'TUE',
            bands: [],
          },
          {
            day: 'WED',
            bands: [],
          },
          {
            day: 'THU',
            bands: [],
          },
          {
            day: 'FRI',
            bands: [],
          },
          {
            day: 'SAT',
            bands: [],
          },
          {
            day: 'SUN',
            bands: [],
          },
        ],
      },
    },
  ],
  limits: {
    steps: 6,
    step_value: 0.5,
    present_max_temp: 23,
    present_min_temp: 17,
    absent_max_temp: 20,
    absent_min_temp: 14,
    present_is_unique: false,
    absent_is_unique: true,
  },
  manual_limits: {
    min_temp: 17,
    max_temp: 23,
    steps: 6,
    step_value: 0.5,
  },
  check_first_time: false,
  set_manual_expiration: false,
  manual_multizona: true,
  setpoints_minutes: ['00', '30'],
  same_mode_for_all_zones: true,
  modal_expiration: false,
};
