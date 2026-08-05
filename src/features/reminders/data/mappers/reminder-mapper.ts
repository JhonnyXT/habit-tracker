import type { Reminder, ReminderKind } from '@/features/reminders/domain/entities/reminder';

export type ReminderRow = {
  id: string;
  habit_id: string;
  time: string;
  enabled: number;
  created_at: string;
  kind: string;
};

export function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    habitId: row.habit_id,
    time: row.time,
    enabled: row.enabled === 1,
    kind: (row.kind as ReminderKind) || 'main',
  };
}
