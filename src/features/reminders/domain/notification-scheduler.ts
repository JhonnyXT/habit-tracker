import type { Weekday } from '@/features/habits/domain/entities/habit';
import type { ClockTime } from '@/features/reminders/domain/entities/reminder';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export type ScheduledReminder = {
  reminderId: string;
  habitId: string;
  habitName: string;
  time: ClockTime;

  days: Weekday[] | null;
};

export interface NotificationScheduler {
  getPermission(): Promise<NotificationPermission>;
  requestPermission(): Promise<NotificationPermission>;

  schedule(reminder: ScheduledReminder): Promise<void>;
  cancel(reminderId: string): Promise<void>;
  cancelAll(): Promise<void>;
}
