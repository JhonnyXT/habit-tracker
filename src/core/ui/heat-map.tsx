import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
  interpolateColor,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import type { HabitColorToken } from '@/core/theme';

type HeatMapProps = {
  values: (number | null)[];
  color: HabitColorToken;
  accessibilityLabel: string;

  rows?: number;
  cellSize?: number;
  gap?: number;
};

type CellProps = {
  value: number;
  size: number;
  solid: string;
  empty: string;
};

function intensity(value: number): number {
  return value > 0 ? 0.25 + value * 0.75 : 1;
}

function LiveCell({ value, size, solid, empty }: CellProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const filled = useSharedValue(value > 0 ? 1 : 0);

  useEffect(() => {
    filled.value = withTiming(value > 0 ? 1 : 0, {
      duration: reducedMotion ? theme.motion.duration.instant : theme.motion.duration.default,
    });
  }, [value, reducedMotion, filled, theme.motion]);

  const dimmed = intensity(value);

  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(filled.value, [0, 1], [empty, solid]),
    opacity: 1 - filled.value * (1 - dimmed),
  }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: 2 }, style]} />
  );
}

export function HeatMap({
  values,
  color,
  accessibilityLabel,
  rows = 7,
  cellSize = 8,
  gap = 2,
}: HeatMapProps) {
  const theme = useAppTheme();
  const solid = theme.colors.habit[color].solid;
  const empty = theme.colors.surface.elevated;
  const lastIndex = values.reduce(
    (last, value, index) => (value === null ? last : index),
    -1,
  );

  const columns: (number | null)[][] = [];
  for (let i = 0; i < values.length; i += rows) {
    columns.push(values.slice(i, i + rows));
  }

  return (
    <View
      style={{ flexDirection: 'row', gap }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      {columns.map((column, columnIndex) => (
        <View key={columnIndex} style={{ gap }}>
          {column.map((value, cellIndex) => {
            const index = columnIndex * rows + cellIndex;

            if (value === null) {
              return (
                <View key={cellIndex} style={{ width: cellSize, height: cellSize }} />
              );
            }

            return index === lastIndex ? (
              <LiveCell key={cellIndex} value={value} size={cellSize} solid={solid} empty={empty} />
            ) : (
              <View
                key={cellIndex}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 2,
                  backgroundColor: value > 0 ? solid : empty,
                  opacity: intensity(value),
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}
