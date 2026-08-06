import { shiftClockTime } from '@/features/reminders/domain/entities/reminder';

describe('shiftClockTime', () => {
  it('shifts earlier within the same day', () => {
    expect(shiftClockTime('07:30', -15)).toBe('07:15');
  });

  it('shifts later within the same day', () => {
    expect(shiftClockTime('07:30', 30)).toBe('08:00');
  });

  it('wraps backward past midnight', () => {
    expect(shiftClockTime('00:05', -15)).toBe('23:50');
  });

  it('wraps forward past midnight', () => {
    expect(shiftClockTime('23:50', 30)).toBe('00:20');
  });

  it('is a no-op with a zero offset', () => {
    expect(shiftClockTime('12:00', 0)).toBe('12:00');
  });
});
