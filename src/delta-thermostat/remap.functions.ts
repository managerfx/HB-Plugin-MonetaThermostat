import { ZoneMode } from '../models/full_bo.response';
import { TargetHeatingCoolingState } from '../models/thermostat-enums';

function isTargetHeatingCoolingState(state: unknown): state is TargetHeatingCoolingState {
  return typeof state === 'number' && Object.values(TargetHeatingCoolingState).includes(state);
}
function isZoneMode(state: unknown): state is ZoneMode {
  return typeof state === 'string' && Object.values(ZoneMode).includes(state as ZoneMode);
}

// export function statusRemap(status: TargetHeatingCoolingState | ZoneMode): TargetHeatingCoolingState | ZoneMode {
//   if (isTargetHeatingCoolingState(status)) {
//     return STATUS_MAP[status]; // ZoneMode
//   }
//   if (isZoneMode(status)) {
//     const a  = Object.keys(STATUS_MAP).reduce((agg, curr)=> ({
// [curr]:
//     }), {}); // ZoneMode
//   }
// }
