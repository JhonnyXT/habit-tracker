import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { create } from 'zustand';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
  interpolate,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import { ThemedText } from '@/core/ui/themed-text';

const VISIBLE_MS = 1400;
const BADGE_SIZE = 72;

type SuccessOverlayState = {
  visible: boolean;
  icon: IconName;
  message: string;
  show: (message: string, icon?: IconName) => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useSuccessOverlayStore = create<SuccessOverlayState>((set) => ({
  visible: false,
  icon: 'check',
  message: '',
  show: (message, icon = 'check') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ visible: true, message, icon });
    hideTimer = setTimeout(() => set({ visible: false }), VISIBLE_MS);
  },
}));

export function SuccessOverlay() {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const visible = useSuccessOverlayStore((state) => state.visible);
  const icon = useSuccessOverlayStore((state) => state.icon);
  const message = useSuccessOverlayStore((state) => state.message);
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
      accessibilityLabel={message}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: theme.colors.surface.scrim,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
        },
        style,
      ]}
    >
      <View
        style={{
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: theme.radius.full,
          backgroundColor: 'rgba(255,255,255,0.16)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={34} color={theme.colors.accent.default} />
      </View>
      <ThemedText variant="title" style={{ color: theme.colors.text.onSolid }}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}
