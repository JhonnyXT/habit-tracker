import { View } from 'react-native';

import { useAppTheme, minTouchTarget } from '@/core/theme';
import type { HabitColorToken } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, PressableScale, Icon } from '@/core/ui';
import { buildMonthGrid, shiftMonth } from '@/features/habits/domain/calendar';
import type { ISODate } from '@/features/habits/domain/date';
import {
  formatDayLong,
  formatMonthTitle,
  weekdayInitials,
} from '@/features/habits/presentation/format';

const CELL_HEIGHT = 40;
const TOUCH_TARGET = minTouchTarget.android;
const HIT_SLOP = Math.max(0, (TOUCH_TARGET - CELL_HEIGHT) / 2);

type MonthCalendarProps = {
  month: ISODate;
  onMonthChange: (month: ISODate) => void;
  history: ISODate[];
  color: HabitColorToken;
  onToggleDay: (date: ISODate) => void;
};

export function MonthCalendar({
  month,
  onMonthChange,
  history,
  color,
  onToggleDay,
}: MonthCalendarProps) {
  const theme = useAppTheme();
  const completed = new Set(history);
  const { weeks, canGoNext } = buildMonthGrid(month);
  const solid = theme.colors.habit[color].solid;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <PressableScale
          onPress={() => onMonthChange(shiftMonth(month, -1))}
          hitSlop={theme.spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={strings.detail.previousMonth}
        >
          <Icon name="back" size={20} color={theme.colors.text.secondary} />
        </PressableScale>

        <ThemedText variant="headline">{formatMonthTitle(month)}</ThemedText>

        <PressableScale
          onPress={() => canGoNext && onMonthChange(shiftMonth(month, 1))}
          disabled={!canGoNext}
          hitSlop={theme.spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={strings.detail.nextMonth}
          accessibilityState={{ disabled: !canGoNext }}
          style={{ opacity: canGoNext ? 1 : 0.25 }}
        >
          <Icon name="chevron" size={20} color={theme.colors.text.secondary} />
        </PressableScale>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {weekdayInitials.map((initial, index) => (
          <ThemedText
            key={index}
            variant="caption"
            color="secondary"
            style={{ flex: 1, textAlign: 'center' }}
          >
            {initial}
          </ThemedText>
        ))}
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            {week.map((cell, dayIndex) => {
              if (cell === null) {
                return <View key={dayIndex} style={{ flex: 1, height: CELL_HEIGHT }} />;
              }

              const done = completed.has(cell.date);
              const label = formatDayLong(cell.date);

              return (
                <PressableScale
                  key={dayIndex}
                  onPress={() => onToggleDay(cell.date)}
                  disabled={cell.future}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel={
                    cell.future
                      ? strings.detail.dayFuture(label)
                      : done
                        ? strings.detail.dayDone(label)
                        : strings.detail.dayNotDone(label)
                  }
                  accessibilityState={{ selected: done, disabled: cell.future }}
                  style={{
                    flex: 1,
                    height: CELL_HEIGHT,
                    borderRadius: theme.radius.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? solid : theme.colors.surface.elevated,
                    opacity: cell.future ? 0.3 : 1,
                  }}
                >
                  <ThemedText
                    variant="footnote"
                    style={{ color: done ? theme.colors.text.onSolid : theme.colors.text.secondary }}
                  >
                    {cell.day}
                  </ThemedText>
                </PressableScale>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
