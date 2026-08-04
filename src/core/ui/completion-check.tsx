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
import type { HabitColorToken } from '@/core/theme';
import { Icon } from '@/core/ui/icon';

type CompletionCheckProps = {
  completed: boolean;
  color: HabitColorToken;
  size?: number;
};

export function CompletionCheck({ completed, color, size = 26 }: CompletionCheckProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    const next = completed ? 1 : 0;
    progress.value = reducedMotion
      ? withTiming(next, { duration: theme.motion.duration.instant })
      : withSpring(next, theme.motion.spring.momentum);
  }, [completed, reducedMotion, progress, theme.motion]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.habit[color].solid,
            alignItems: 'center',
            justifyContent: 'center',
          },
          fillStyle,
        ]}
      >
        <Icon name="check" size={size * 0.55} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
}
