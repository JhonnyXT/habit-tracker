import { useEffect, useRef, useState } from 'react';
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
import { ThemedText, Icon } from '@/core/ui';

const VISIBLE_MS = 2000;
const BADGE_SIZE = 72;

export function useDayComplete(done: number, total: number): boolean {
  const complete = total > 0 && done === total;
  const previousDone = useRef<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  if (!complete && celebrating) {
    setCelebrating(false);
  }

  useEffect(() => {
    const justCompleted = previousDone.current !== null && previousDone.current < done && complete;
    previousDone.current = done;

    if (!justCompleted) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCelebrating(true);

    const timer = setTimeout(() => setCelebrating(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [done, complete]);

  return celebrating;
}

export function DayCompleteOverlay({ visible }: { visible: boolean }) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = reducedMotion
      ? withTiming(visible ? 1 : 0, { duration: theme.motion.duration.fast })
      : visible
        ? withSpring(1, theme.motion.spring.momentum)
        : withTiming(0, { duration: theme.motion.duration.default });
  }, [visible, reducedMotion, progress, theme.motion]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.6, 1]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      accessible={visible}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${strings.today.allDone}. ${strings.today.allDoneMessage}`}
      style={[
        StyleSheet.absoluteFill,
        { alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
        style,
      ]}
    >
      <View
        style={{
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.accent.subtle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="streak" size={34} color={theme.colors.accent.default} />
      </View>

      <View style={{ alignItems: 'center', gap: theme.spacing.xxs }}>
        <ThemedText variant="title">{strings.today.allDone}</ThemedText>
        <ThemedText variant="subheadline" color="secondary">
          {strings.today.allDoneMessage}
        </ThemedText>
      </View>
    </Animated.View>
  );
}
