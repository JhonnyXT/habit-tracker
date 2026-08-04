import { useRef } from 'react';
import { ScrollView, View } from 'react-native';

import { useAppTheme } from '@/core/theme';
import type { HabitColorToken } from '@/core/theme';
import { ThemedText, HeatMap } from '@/core/ui';
import { WEEK_LENGTH, buildYearStrip } from '@/features/habits/domain/calendar';
import type { ISODate } from '@/features/habits/domain/date';
import { formatMonthShort, weekdayInitials } from '@/features/habits/presentation/format';

const CELL_SIZE = 10;
const GAP = 3;
const COLUMN_STRIDE = CELL_SIZE + GAP;
const LABELLED_ROWS = [0, 2, 4, 6];

type YearHeatMapProps = {
  history: ISODate[];
  end: ISODate;
  days: number;
  color: HabitColorToken;
  accessibilityLabel: string;
};

export function YearHeatMap({
  history,
  end,
  days,
  color,
  accessibilityLabel,
}: YearHeatMapProps) {
  const theme = useAppTheme();
  const scroll = useRef<ScrollView>(null);
  const completed = new Set(history);
  const { cells, monthColumns } = buildYearStrip(end, days);

  const values = cells.map((cell) => (cell === null ? null : completed.has(cell.date) ? 1 : 0));

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
      <View style={{ gap: GAP }}>
        <View style={{ height: CELL_SIZE }} />
        {Array.from({ length: WEEK_LENGTH }, (_, row) => (
          <View key={row} style={{ height: CELL_SIZE, justifyContent: 'center' }}>
            <ThemedText variant="caption" color="secondary">
              {LABELLED_ROWS.includes(row) ? weekdayInitials[row] : ' '}
            </ThemedText>
          </View>
        ))}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={{ gap: GAP, flexDirection: 'column' }}
      >
        <View style={{ height: CELL_SIZE }}>
          {monthColumns.map(({ column, date }) => (
            <ThemedText
              key={date}
              variant="caption"
              color="secondary"
              style={{ position: 'absolute', left: column * COLUMN_STRIDE }}
            >
              {formatMonthShort(date)}
            </ThemedText>
          ))}
        </View>

        <HeatMap
          values={values}
          color={color}
          accessibilityLabel={accessibilityLabel}
          rows={WEEK_LENGTH}
          cellSize={CELL_SIZE}
          gap={GAP}
        />
      </ScrollView>
    </View>
  );
}
