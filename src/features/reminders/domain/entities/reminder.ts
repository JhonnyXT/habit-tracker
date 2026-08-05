export type ClockTime = string;

export type ReminderKind = 'main' | 'pre' | 'followup';

export type Reminder = {
  id: string;
  habitId: string;
  time: ClockTime;
  enabled: boolean;
  kind: ReminderKind;
};

export const DEFAULT_REMINDER_TIME: ClockTime = '07:30';

export const PRE_REMINDER_OFFSET_MINUTES = -15;
export const FOLLOWUP_REMINDER_OFFSET_MINUTES = 30;

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

export function shiftClockTime(time: ClockTime, offsetMinutes: number): ClockTime {
  const { hour, minute } = parseClockTime(time);
  const totalMinutes = (((hour * 60 + minute + offsetMinutes) % 1440) + 1440) % 1440;
  const shiftedHour = Math.floor(totalMinutes / 60);
  const shiftedMinute = totalMinutes % 60;
  return `${String(shiftedHour).padStart(2, '0')}:${String(shiftedMinute).padStart(2, '0')}`;
}
