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
import { ThemedText, Icon, CompletionCheck, GestureTap, ProgressBar, ICON_WELL_SIZE } from '@/core/ui';
import { strings } from '@/core/i18n';
import type { IconName } from '@/core/ui/icons';
import type { Habit } from '@/features/habits/domain/entities/habit';
import type { TaskProgress } from '@/features/habits/domain/task-progress';

export const HABIT_ROW_HEIGHT = 72;
export const HABIT_ROW_SEPARATOR_INSET = spacing.md * 2 + ICON_WELL_SIZE;

type HabitRowProps = {
  habit: Habit;
  subtitle: string;
  subtitleIcon: IconName;
  streakCount?: number;
  completed: boolean;
  taskProgress?: TaskProgress | null;
  onToggle: () => void;
  expandable?: boolean;
  expanded?: boolean;
};

export function HabitRow({
  habit,
  subtitle,
  subtitleIcon,
  streakCount = 0,
  completed,
  taskProgress,
  onToggle,
  expandable = false,
  expanded = false,
}: HabitRowProps) {
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

  const wellOverlay = theme.scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.65)';

  const nameNode = (
    <Animated.View
      style={[{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }, textStyle]}
    >
      <View style={{ alignSelf: 'flex-start' }}>
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
      </View>

      {streakCount > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Icon name="streak" size={12} color={theme.colors.text.accent} />
          <ThemedText variant="footnote" style={{ color: theme.colors.text.accent, fontWeight: '700' }}>
            {streakCount}
          </ThemedText>
        </View>
      ) : null}
    </Animated.View>
  );

  const subtitleNode = (
    <Animated.View style={textStyle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
        <Icon name={subtitleIcon} size={12} color={theme.colors.text.accent} />
        <ThemedText variant="footnote" style={{ color: theme.colors.text.accent }}>
          {subtitle}
        </ThemedText>
      </View>
    </Animated.View>
  );

  const checkbox = (
    <GestureTap
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={strings.a11y.toggleHabit(habit.name)}
      hitSlop={theme.spacing.sm}
    >
      <CompletionCheck completed={completed} color={habit.color} />
    </GestureTap>
  );

  return (
    <View
      style={{
        minHeight: HABIT_ROW_HEIGHT,
        justifyContent: 'center',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.habit[habit.color].tint,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
        <View
          style={{
            width: ICON_WELL_SIZE,
            height: ICON_WELL_SIZE,
            borderRadius: theme.radius.full,
            backgroundColor: wellOverlay,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={habit.icon}
            size={ICON_WELL_SIZE * 0.5}
            color={theme.colors.habit[habit.color].solid}
          />
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          {nameNode}
          {subtitleNode}

          {taskProgress && taskProgress.totalCount > 0 ? (
            <View style={{ marginTop: 2, marginRight: theme.spacing.lg }}>
              <ProgressBar
                value={taskProgress.completedCount / taskProgress.totalCount}
                height={3}
                trackColor={wellOverlay}
                fillColor={theme.colors.habit[habit.color].solid}
              />
            </View>
          ) : null}
        </View>

        {expandable ? (
          <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
            <Icon name="chevron" size={16} color={theme.colors.text.secondary} />
          </View>
        ) : null}

        {checkbox}
      </View>
    </View>
  );
}
