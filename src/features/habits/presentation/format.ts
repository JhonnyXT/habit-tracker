import { strings } from '@/core/i18n';
import { fromISODate, type ISODate } from '@/features/habits/domain/date';
import type { Schedule } from '@/features/habits/domain/entities/habit';
import type { Streaks } from '@/features/habits/domain/streak';
import type { TaskProgress } from '@/features/habits/domain/task-progress';

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

export function describeTaskProgress(progress: TaskProgress): string {
  return strings.tasks.progress(progress.completedCount, progress.totalCount);
}

export function formatToday(date: Date): string {
  const text = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const weekdayInitials = Array.from({ length: 7 }, (_, index) =>
  new Date(2026, 5, 1 + index).toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase(),
);

export function formatMonthShort(iso: ISODate): string {
  return fromISODate(iso).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
}

export function formatMonthTitle(iso: ISODate): string {
  const text = fromISODate(iso).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDayLong(iso: ISODate): string {
  return fromISODate(iso).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDeadline(date: Date): string {
  const day = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
  const time = new Intl.DateTimeFormat('es', { hour: 'numeric', minute: '2-digit', hour12: true }).format(
    date,
  );
  return `${day} · ${time}`;
}
