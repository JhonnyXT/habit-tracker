import {
  WEEK_LENGTH,
  buildMonthGrid,
  buildYearStrip,
  shiftMonth,
  startOfMonth,
} from '@/features/habits/domain/calendar';
import { weekdayOf } from '@/features/habits/domain/date';

describe('buildYearStrip', () => {
  it('always starts row 0 on a Monday, whatever the end date is', () => {
    for (const end of ['2026-08-03', '2026-08-04', '2026-08-08', '2026-08-09', '2026-01-01']) {
      const { cells } = buildYearStrip(end, 364);

      const firstDated = cells.findIndex((cell) => cell !== null);
      const firstDate = cells[firstDated];
      expect(firstDate).not.toBeNull();

      expect(weekdayOf(firstDate!.date)).toBe(
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][firstDated % WEEK_LENGTH],
      );
      expect(firstDated).toBeLessThan(WEEK_LENGTH);
    }
  });

  it('pads the leading days so row 0 is Monday', () => {
    const { cells } = buildYearStrip('2026-08-03', 364);

    cells.forEach((cell, index) => {
      if (!cell) return;
      const row = index % WEEK_LENGTH;
      const expected = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][row];
      expect(weekdayOf(cell.date)).toBe(expected);
    });
  });

  it('uses null for padding rather than an empty day', () => {
    const { cells } = buildYearStrip('2026-08-03', 364);
    const dated = cells.filter((cell) => cell !== null);

    expect(dated).toHaveLength(364);
    expect(cells.length).toBeGreaterThanOrEqual(364);
    expect(cells.length % WEEK_LENGTH).toBe(0);
  });

  it('ends on the requested day, padding out the final partial week', () => {
    const { cells } = buildYearStrip('2026-08-03', 364);
    const dated = cells.filter((cell) => cell !== null);

    expect(dated[dated.length - 1]).toEqual({ date: '2026-08-03' });
    expect(cells[cells.length - 1]).toBeNull();
  });

  it('marks the column where each month starts', () => {
    const { cells, monthColumns } = buildYearStrip('2026-08-03', 364);

    expect(monthColumns.length).toBeGreaterThanOrEqual(12);

    for (const { column, date } of monthColumns) {
      const inColumn = cells.slice(column * WEEK_LENGTH, (column + 1) * WEEK_LENGTH);
      expect(inColumn).toContainEqual({ date });
    }
  });

  it('crosses the year boundary without losing a month', () => {
    const { monthColumns } = buildYearStrip('2026-03-15', 364);
    const months = monthColumns.map(({ date }) => date.slice(0, 7));

    expect(months).toContain('2025-12');
    expect(months).toContain('2026-01');
    expect(new Set(months).size).toBe(months.length);
  });
});

describe('startOfMonth and shiftMonth', () => {
  it('normalises any day to the first of its month', () => {
    expect(startOfMonth('2026-08-31')).toBe('2026-08-01');
  });

  it('steps backwards across the year boundary', () => {
    expect(shiftMonth('2026-01-15', -1)).toBe('2025-12-01');
  });

  it('steps forwards across the year boundary', () => {
    expect(shiftMonth('2025-12-01', 1)).toBe('2026-01-01');
  });

  it('does not overflow when stepping from a long month', () => {
    expect(shiftMonth('2026-01-31', 1)).toBe('2026-02-01');
  });
});

describe('buildMonthGrid', () => {
  it('places the first of the month on its real weekday', () => {
    const { weeks } = buildMonthGrid('2026-08-01', '2026-08-03');

    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][5]).toEqual({ date: '2026-08-01', day: 1, future: false });
  });

  it('covers every day of a 31-day month', () => {
    const days = buildMonthGrid('2026-08-01', '2026-08-31')
      .weeks.flat()
      .filter((cell) => cell !== null);

    expect(days).toHaveLength(31);
    expect(days[30]?.day).toBe(31);
  });

  it('covers every day of a 30-day month', () => {
    const days = buildMonthGrid('2026-09-01', '2026-09-30')
      .weeks.flat()
      .filter((cell) => cell !== null);

    expect(days).toHaveLength(30);
  });

  it('covers every day of a 28-day February', () => {
    const days = buildMonthGrid('2026-02-01', '2026-03-01')
      .weeks.flat()
      .filter((cell) => cell !== null);

    expect(days).toHaveLength(28);
  });

  it('covers every day of a leap February', () => {
    const days = buildMonthGrid('2028-02-01', '2028-03-01')
      .weeks.flat()
      .filter((cell) => cell !== null);

    expect(days).toHaveLength(29);
  });

  it('pads every week to seven cells', () => {
    for (const month of ['2026-02-01', '2026-08-01', '2026-09-01']) {
      for (const week of buildMonthGrid(month, '2026-12-31').weeks) {
        expect(week).toHaveLength(WEEK_LENGTH);
      }
    }
  });

  it('marks days after today as future (FR-5.3)', () => {
    const days = buildMonthGrid('2026-08-01', '2026-08-03')
      .weeks.flat()
      .filter((cell) => cell !== null);

    expect(days.find((cell) => cell.day === 3)?.future).toBe(false);
    expect(days.find((cell) => cell.day === 4)?.future).toBe(true);
  });

  it('refuses to advance past the current month', () => {
    expect(buildMonthGrid('2026-08-01', '2026-08-03').canGoNext).toBe(false);
    expect(buildMonthGrid('2026-07-01', '2026-08-03').canGoNext).toBe(true);
    expect(buildMonthGrid('2025-12-01', '2026-08-03').canGoNext).toBe(true);
  });
});
