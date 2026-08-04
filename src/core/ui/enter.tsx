import { useCallback, useRef, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const STAGGER_MS = 45;
const ENTER_MS = 260;
const OFFSET = 12;

type EnterProps = {
  index?: number;
  lift?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function Enter({ index = 0, lift = true, style, children }: EnterProps) {
  const progress = useSharedValue(0);
  const hasEntered = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (hasEntered.current) {
        progress.value = 1;
        return;
      }

      progress.value = 0;
      progress.value = withDelay(
        index * STAGGER_MS,
        withTiming(1, { duration: ENTER_MS, easing: Easing.out(Easing.quad) }),
      );

      return () => {
        hasEntered.current = true;
      };
    }, [index, progress]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: lift ? [{ translateY: (1 - progress.value) * OFFSET }] : [],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
