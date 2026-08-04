import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { spacing } from '@/core/theme/spacing';
import { ThemedText, IconWell, CompletionCheck, ICON_WELL_SIZE } from '@/core/ui';
import type { Habit } from '@/features/habits/domain/entities/habit';

export const HABIT_ROW_HEIGHT = 72;
export const HABIT_ROW_SEPARATOR_INSET = spacing.md * 2 + ICON_WELL_SIZE;

type HabitRowProps = {
  habit: Habit;
  subtitle: string;
  completed: boolean;
};

export function HabitRow({ habit, subtitle, completed }: HabitRowProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(completed ? 1 : 0);
  const [nameWidth, setNameWidth] = useState(0);

  useEffect(() => {
    const next = completed ? 1 : 0;
    progress.value = reducedMotion
      ? withTiming(next, { duration: theme.motion.duration.instant })
      : withSpring(next, theme.motion.spring.momentum);
  }, [completed, reducedMotion, progress, theme.motion]);

  const strikeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [1, 0.45]),
  }));

  const onNameLayout = (event: LayoutChangeEvent) =>
    setNameWidth(event.nativeEvent.layout.width);

  return (
    <View
      style={{
        height: HABIT_ROW_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface.secondary,
      }}
    >
      <IconWell name={habit.icon} color={habit.color} />

      <View style={{ flex: 1, gap: 2 }}>
        <Animated.View style={[{ alignSelf: 'flex-start' }, textStyle]}>
          <ThemedText variant="headline" onLayout={onNameLayout}>
            {habit.name}
          </ThemedText>
          {nameWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: '55%',
                  left: 0,
                  width: nameWidth,
                  height: 1.5,
                  borderRadius: 1,
                  backgroundColor: theme.colors.text.primary,
                  transformOrigin: 'left',
                },
                strikeStyle,
              ]}
            />
          ) : null}
        </Animated.View>

        <Animated.View style={textStyle}>
          <ThemedText variant="footnote" style={{ color: theme.colors.text.accent }}>
            {subtitle}
          </ThemedText>
        </Animated.View>
      </View>

      <CompletionCheck completed={completed} color={habit.color} />
    </View>
  );
}
