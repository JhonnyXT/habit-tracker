import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';

type ProgressBarProps = {
  value: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
};

export function ProgressBar({ value, height = 4, trackColor, fillColor }: ProgressBarProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(value);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(1, value));
    progress.value = reducedMotion
      ? withTiming(clamped, { duration: theme.motion.duration.fast })
      : withSpring(clamped, theme.motion.spring.default);
  }, [value, reducedMotion, progress, theme.motion]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View
      style={{
        height,
        borderRadius: theme.radius.full,
        backgroundColor: trackColor ?? theme.colors.surface.elevated,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height,
            borderRadius: theme.radius.full,
            backgroundColor: fillColor ?? theme.colors.accent.default,
            transformOrigin: 'left',
          },
          fillStyle,
        ]}
      />
    </View>
  );
}
