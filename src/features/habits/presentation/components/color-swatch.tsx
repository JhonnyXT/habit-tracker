import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

import { useAppTheme, type HabitColorToken } from '@/core/theme';

const SIZE = 30;
const SELECTED_SCALE = 26 / SIZE;

type ColorSwatchProps = {
  color: HabitColorToken;
  selected: boolean;
};

export function ColorSwatch({ color, selected }: ColorSwatchProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const shrink = useSharedValue(selected ? SELECTED_SCALE : 1);

  useEffect(() => {
    const next = selected ? SELECTED_SCALE : 1;
    shrink.value = reducedMotion
      ? withTiming(next, { duration: theme.motion.duration.instant })
      : withSpring(next, theme.motion.spring.snappy);
  }, [selected, reducedMotion, shrink, theme.motion]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: shrink.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: SIZE,
          height: SIZE,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.habit[color].solid,
        },
        style,
      ]}
    />
  );
}
