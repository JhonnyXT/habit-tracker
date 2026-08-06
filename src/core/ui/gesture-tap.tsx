import type { AccessibilityRole, AccessibilityState, StyleProp, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
  runOnJS,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';

type GestureTapProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
  hitSlop?: number;
};

// A GestureDetector nested inside another GestureDetector (the row's
// drag/swipe/tap gesture) is hit-tested first and wins for touches within its
// own bounds — unlike a plain RN Pressable nested the same way, which uses a
// completely separate touch-responder system that doesn't coordinate with
// RNGH's gesture arena, so both the button's onPress AND the parent row's tap
// gesture fire for the same touch. Use this instead of PressableScale for any
// tap target nested inside a DraggableHabitList row.
export function GestureTap({
  onPress,
  children,
  style,
  activeScale,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
  hitSlop,
}: GestureTapProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const target = activeScale ?? theme.motion.pressScale;

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onBegin(() => {
      if (!reducedMotion) scale.value = withSpring(target, theme.motion.spring.snappy);
    })
    .onFinalize((_event, success) => {
      if (!reducedMotion) scale.value = withSpring(1, theme.motion.spring.snappy);
      if (success) runOnJS(onPress)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={hitSlop ? tap.hitSlop(hitSlop) : tap}>
      <Animated.View
        accessible
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={accessibilityState}
        style={[style, animatedStyle]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
