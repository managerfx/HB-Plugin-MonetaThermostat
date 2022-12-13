export function addMinutes(date: Date, timeToAdd: number, type: 'm' | 's'): Date {
  const MULT_MAP = {
    s: 1000,
    m: 60000,
  };
  return new Date(date.getTime() + timeToAdd * MULT_MAP[type]);
}

export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}