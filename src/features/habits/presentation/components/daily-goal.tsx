import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, ProgressBar, Icon } from '@/core/ui';

type DailyGoalProps = {
  done: number;
  total: number;
};

export function DailyGoal({ done, total }: DailyGoalProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const complete = total > 0 && done === total;

  const lit = useSharedValue(complete ? 1 : 0);

  useEffect(() => {
    lit.value = reducedMotion
      ? withTiming(complete ? 1 : 0, { duration: theme.motion.duration.instant })
      : withSpring(complete ? 1 : 0, theme.motion.spring.snappy);
  }, [complete, reducedMotion, lit, theme.motion]);

  const flameStyle = useAnimatedStyle(() => ({
    opacity: lit.value,
    transform: [{ scale: interpolate(lit.value, [0, 1], [0.5, 1]) }],
    marginRight: interpolate(lit.value, [0, 1], [0, theme.spacing.xs]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(lit.value, [0, 1], [0, theme.scheme === 'dark' ? 0.5 : 0.3]),
    elevation: interpolate(lit.value, [0, 1], [0, 8]),
  }));

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.surface.secondary,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
          shadowColor: theme.colors.accent.default,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
        },
        glowStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="footnote" color="secondary">
          {strings.today.dailyGoal}
        </ThemedText>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Animated.View style={flameStyle}>
            <Icon name="streak" size={13} color={theme.colors.accent.default} />
          </Animated.View>
          <ThemedText
            variant="footnote"
            style={{
              color: complete ? theme.colors.accent.default : theme.colors.text.secondary,
            }}
          >
            {complete ? strings.today.allDone : strings.today.doneCount(done, total)}
          </ThemedText>
        </View>
      </View>

      <ProgressBar value={total > 0 ? done / total : 0} />
    </Animated.View>
  );
}
