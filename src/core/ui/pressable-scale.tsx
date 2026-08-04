import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;

  activeScale?: number;
};

export function PressableScale({ style, activeScale, children, ...rest }: PressableScaleProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const target = activeScale ?? theme.motion.pressScale;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        if (!reducedMotion) scale.value = withSpring(target, theme.motion.spring.snappy);
      }}
      onPressOut={() => {
        if (!reducedMotion) scale.value = withSpring(1, theme.motion.spring.snappy);
      }}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
