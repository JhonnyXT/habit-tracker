import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, ProgressBar, Icon } from '@/core/ui';

const CONTENT_HEIGHT = 52;

type DailyGoalProps = {
  done: number;
  total: number;
};

export function DailyGoal({ done, total }: DailyGoalProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const complete = total > 0 && done === total;

  const celebration = useSharedValue(complete ? 1 : 0);
  const previousDone = useRef<number | null>(null);

  useEffect(() => {
    const justCompleted = previousDone.current !== null && previousDone.current < done && complete;
    previousDone.current = done;

    if (justCompleted) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    celebration.value =
      reducedMotion || !justCompleted
        ? withTiming(complete ? 1 : 0, { duration: theme.motion.duration.fast })
        : withSpring(1, theme.motion.spring.momentum);
  }, [done, complete, reducedMotion, celebration, theme.motion]);

  const progressStyle = useAnimatedStyle(() => ({
    opacity: 1 - celebration.value,
    transform: [{ scale: interpolate(celebration.value, [0, 1], [1, 0.96]) }],
  }));

  const celebrationStyle = useAnimatedStyle(() => ({
    opacity: celebration.value,
    transform: [{ scale: interpolate(celebration.value, [0, 1], [0.6, 1]) }],
  }));

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface.secondary,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
      }}
    >
      <View style={{ height: CONTENT_HEIGHT, justifyContent: 'center' }}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { justifyContent: 'center', gap: theme.spacing.sm }, progressStyle]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="footnote" color="secondary">
              {strings.today.dailyGoal}
            </ThemedText>
            <ThemedText variant="footnote" color="secondary">
              {strings.today.doneCount(done, total)}
            </ThemedText>
          </View>

          <ProgressBar value={total > 0 ? done / total : 0} />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          accessible
          accessibilityLabel={`${strings.today.allDone}. ${strings.today.allDoneMessage(total)}`}
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xxs },
            celebrationStyle,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
            <Icon name="streak" size={20} color={theme.colors.accent.default} />
            <ThemedText variant="headline" style={{ color: theme.colors.accent.default }}>
              {strings.today.allDone}
            </ThemedText>
          </View>
          <ThemedText variant="footnote" color="secondary">
            {strings.today.allDoneMessage(total)}
          </ThemedText>
        </Animated.View>
      </View>
    </View>
  );
}
