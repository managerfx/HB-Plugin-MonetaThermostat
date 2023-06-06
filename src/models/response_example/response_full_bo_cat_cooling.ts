export const FULL_BO_RESP_COOLING = {
  provider: 'A2A',
  unitCode: '1021_0A_00_090_00',
  measureUnit: '°C',
  externalTemperature: 23.05,
  category: 'cooling',
  season: {
    id: 'summer',
    limits: null,
  },
  zones: [
    {
      id: '1',
      temperature: 25.36,
      humidity: null,
      atHome: false,
      atHomeForScheduler: false,
      blockHumidity: false,
      effectiveSetpoint: 35,
      setpoints: [
        {
          type: 'present',
          temperature: 26.5,
        },
        {
          type: 'absent',
          temperature: 35,
        },
      ],
      mode: 'auto',
      setpointSelected: 'absent',
      expiration: null,
      currentManualTemperature: 26.5,
      dateExpiration: null,
      calendar: {
        step: 30,
        schedule: [
          {
            day: 'MON',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'TUE',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'WED',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'THU',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'FRI',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'SAT',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'SUN',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
        ],
      },
    },
    {
      id: '3',
      temperature: 24.26,
      humidity: null,
      atHome: false,
      atHomeForScheduler: false,
      blockHumidity: false,
      effectiveSetpoint: 35,
      setpoints: [
        {
          type: 'present',
          temperature: 26,
        },
        {
          type: 'absent',
          temperature: 35,
        },
      ],
      mode: 'auto',
      setpointSelected: 'absent',
      expiration: null,
      currentManualTemperature: 26,
      dateExpiration: null,
      calendar: {
        step: 30,
        schedule: [
          {
            day: 'MON',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'TUE',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'WED',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'THU',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'FRI',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'SAT',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
          {
            day: 'SUN',
            bands: [
              {
                id: 1,
                setpointType: 'present',
                start: {
                  hour: 16,
                  min: 0,
                },
                end: {
                  hour: 21,
                  min: 30,
                },
              },
            ],
          },
        ],
      },
    },
  ],
  limits: {
    steps: 6,
    step_value: 1,
    present_max_temp: 29,
    present_min_temp: 23,
    absent_max_temp: 35,
    absent_min_temp: 26,
    present_is_unique: false,
    absent_is_unique: true,
  },
  manual_limits: {
    min_temp: 23,
    max_temp: 29,
    steps: 6,
    step_value: 1,
  },
  check_first_time: false,
  set_manual_expiration: false,
  manual_multizona: true,
  setpoints_minutes: ['00', '30'],
  same_mode_for_all_zones: true,
  modal_expiration: false,
};
