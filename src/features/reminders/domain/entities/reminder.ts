export type ClockTime = string;

export type Reminder = {
  id: string;
  habitId: string;
  time: ClockTime;
  enabled: boolean;
};

export const DEFAULT_REMINDER_TIME: ClockTime = '07:30';

const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isClockTime(value: string): value is ClockTime {
  return CLOCK_TIME_PATTERN.test(value);
}

export function toClockTime(date: Date): ClockTime {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseClockTime(time: ClockTime): { hour: number; minute: number } {
  const [hour, minute] = time.split(':');
  return { hour: Number(hour), minute: Number(minute) };
}
