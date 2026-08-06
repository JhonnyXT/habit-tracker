import { View } from 'react-native';

import { useAppTheme, minTouchTarget } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, PressableScale, Icon } from '@/core/ui';
import { buildDeadlineMonthGrid, shiftMonth } from '@/features/habits/domain/calendar';
import type { ISODate } from '@/features/habits/domain/date';
import { formatDayLong, formatMonthTitle, weekdayInitials } from '@/features/habits/presentation/format';

const CELL_HEIGHT = 40;
const TOUCH_TARGET = minTouchTarget.android;
const HIT_SLOP = Math.max(0, (TOUCH_TARGET - CELL_HEIGHT) / 2);

type DeadlineCalendarProps = {
  month: ISODate;
  onMonthChange: (month: ISODate) => void;
  selected: ISODate | null;
  onSelectDay: (date: ISODate) => void;
};

export function DeadlineCalendar({ month, onMonthChange, selected, onSelectDay }: DeadlineCalendarProps) {
  const theme = useAppTheme();
  const { weeks } = buildDeadlineMonthGrid(month);

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
          onPress={() => onMonthChange(shiftMonth(month, 1))}
          hitSlop={theme.spacing.sm}
          accessibilityRole="button"
          accessibilityLabel={strings.detail.nextMonth}
        >
          <Icon name="chevron" size={20} color={theme.colors.text.secondary} />
        </PressableScale>
      </View>

      <View style={{ flexDirection: 'row' }}>
        {weekdayInitials.map((initial, index) => (
          <ThemedText key={index} variant="caption" color="secondary" style={{ flex: 1, textAlign: 'center' }}>
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

              const isSelected = selected === cell.date;
              const label = formatDayLong(cell.date);

              return (
                <PressableScale
                  key={dayIndex}
                  onPress={() => onSelectDay(cell.date)}
                  disabled={cell.past}
                  hitSlop={HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isSelected, disabled: cell.past }}
                  style={{
                    flex: 1,
                    height: CELL_HEIGHT,
                    borderRadius: theme.radius.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isSelected ? theme.colors.accent.default : theme.colors.surface.elevated,
                    opacity: cell.past ? 0.3 : 1,
                  }}
                >
                  <ThemedText
                    variant="footnote"
                    style={{ color: isSelected ? theme.colors.text.onSolid : theme.colors.text.secondary }}
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
