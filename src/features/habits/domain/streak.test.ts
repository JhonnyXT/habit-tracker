import { computeStreaks } from '@/features/habits/domain/streak';
import type { Schedule } from '@/features/habits/domain/entities/habit';

const daily: Schedule = { type: 'daily' };

const mondayWedFri: Schedule = { type: 'weekdays', days: ['mon', 'wed', 'fri'] };
const threePerWeek: Schedule = { type: 'timesPerWeek', count: 3 };

describe('computeStreaks — daily', () => {
  it('counts consecutive completed days ending today', () => {
    const result = computeStreaks(daily, ['2026-07-28', '2026-07-29', '2026-07-30'], '2026-07-30');
    expect(result.current).toBe(3);
    expect(result.unit).toBe('day');
  });

  it('does not break the streak when today is simply not done yet (FR-4.2)', () => {
    const result = computeStreaks(daily, ['2026-07-28', '2026-07-29'], '2026-07-30');
    expect(result.current).toBe(2);
  });

  it('breaks the streak once a completed day is missed', () => {
    const result = computeStreaks(daily, ['2026-07-27', '2026-07-29'], '2026-07-30');
    expect(result.current).toBe(1);
  });

  it('reports zero for a habit with no history', () => {
    expect(computeStreaks(daily, [], '2026-07-30')).toEqual({
      current: 0,
      longest: 0,
      unit: 'day',
    });
  });

  it('remembers the longest streak even after it is broken (FR-4.3)', () => {
    const history = [
      '2026-07-01',
      '2026-07-02',
      '2026-07-03',
      '2026-07-04',

      '2026-07-30',
    ];
    const result = computeStreaks(daily, history, '2026-07-30');
    expect(result.current).toBe(1);
    expect(result.longest).toBe(4);
  });
});

describe('computeStreaks — specific weekdays', () => {
  it('skips unscheduled days instead of treating them as breaks', () => {
    const result = computeStreaks(mondayWedFri, ['2026-07-27', '2026-07-29'], '2026-07-29');
    expect(result.current).toBe(2);
  });

  it('breaks when a scheduled day is missed', () => {
    const result = computeStreaks(mondayWedFri, ['2026-07-27'], '2026-07-30');
    expect(result.current).toBe(0);
  });
});

describe('computeStreaks — times per week', () => {
  it('counts weeks that met the target, not days', () => {
    const history = [

      '2026-07-20',
      '2026-07-22',
      '2026-07-24',

      '2026-07-27',
      '2026-07-29',
      '2026-07-30',
    ];
    const result = computeStreaks(threePerWeek, history, '2026-07-30');
    expect(result.unit).toBe('week');
    expect(result.current).toBe(2);
  });

  it('does not punish a partially-complete current week', () => {
    const history = [

      '2026-07-20',
      '2026-07-22',
      '2026-07-24',

      '2026-07-27',
    ];
    const result = computeStreaks(threePerWeek, history, '2026-07-30');
    expect(result.current).toBe(1);
  });

  it('breaks when a full week missed the target', () => {
    const history = ['2026-07-20', '2026-07-22'];
    const result = computeStreaks(threePerWeek, history, '2026-07-30');
    expect(result.current).toBe(0);
  });
});
