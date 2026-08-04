import { strings } from '@/core/i18n';
import type { Schedule } from '@/features/habits/domain/entities/habit';
import type { Streaks } from '@/features/habits/domain/streak';

export function describeSchedule(schedule: Schedule): string {
  switch (schedule.type) {
    case 'daily':
      return strings.schedule.daily;
    case 'weekdays':
      return schedule.days.map((day) => strings.weekdayNames[day]).join(', ');
    case 'timesPerWeek':
      return strings.schedule.timesPerWeek(schedule.count);
  }
}

export function describeStreak(streaks: Streaks): string {
  return strings.habits.streak(streaks.current, streaks.unit);
}

export function formatToday(date: Date): string {
  const text = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
