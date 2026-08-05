import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { colors as staticColors } from '@/core/theme/colors';
import { Icon } from '@/core/ui/icon';
import { IconWell } from '@/core/ui/icon-well';
import { ThemedText } from '@/core/ui/themed-text';
import { strings } from '@/core/i18n';
import type { IconName } from '@/core/ui/icons';

// These ghost cards represent paper-colored mock cards, not real UI
// surfaces — like a physical pastel card, they don't change with dark mode,
// so they intentionally always read from the light palette regardless of
// the active theme.
const GHOST_CARD_PINK = staticColors.light.habit.pink.tint;
const GHOST_CARD_BLUE = staticColors.light.habit.blue.tint;
const GHOST_TEXT_COLOR = staticColors.light.text.primary;
const GHOST_CHECK_COLOR = staticColors.light.text.secondary;

const CARD_WIDTH = 240;

// translateX/rotate are static, but they MUST live in this same animated
// transform array as translateY — RN replaces (never merges) a style array's
// `transform` property wholesale, so splitting the static transform into a
// separate style object would silently discard it once the animated style
// is applied on top.
function useFloat(
  amplitude: number,
  durationMs: number,
  delayMs: number,
  disabled: boolean,
  staticTranslateX: number,
  rotateDeg: number,
) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    progress.value = withDelay(
      delayMs,
      withRepeat(
        withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [disabled, durationMs, delayMs, progress]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateX: staticTranslateX },
      { translateY: -progress.value * amplitude },
      { rotate: `${rotateDeg}deg` },
    ],
  }));
}

function GhostCardRow({ icon, name, detail }: { icon: IconName; name: string; detail: string }) {
  return (
    <View style={{ position: 'absolute', top: 6, left: 16, gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: GHOST_CHECK_COLOR,
          }}
        />
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={11} color={GHOST_TEXT_COLOR} />
        </View>
        <ThemedText variant="footnote" numberOfLines={1} style={{ color: GHOST_TEXT_COLOR }}>
          {name}
        </ThemedText>
      </View>
      <ThemedText
        variant="caption"
        numberOfLines={1}
        style={{ color: GHOST_TEXT_COLOR, opacity: 0.7, marginLeft: 26 }}
      >
        {detail}
      </ThemedText>
    </View>
  );
}

export function EmptyTodayPreview() {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const floatA = useFloat(8, 4200, 0, reducedMotion, -6, -6);
  const floatB = useFloat(6, 3600, 250, reducedMotion, 6, 5);

  return (
    <View style={{ width: CARD_WIDTH + 64, height: 248, alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            width: CARD_WIDTH,
            height: 100,
            borderRadius: theme.radius.xl,
            backgroundColor: GHOST_CARD_PINK,
          },
          floatA,
        ]}
      >
        <GhostCardRow
          icon="book"
          name={strings.today.previewGhostCardName}
          detail={strings.today.previewGhostCardDetail}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 40,
            width: CARD_WIDTH,
            height: 100,
            borderRadius: theme.radius.xl,
            backgroundColor: GHOST_CARD_BLUE,
          },
          floatB,
        ]}
      >
        <GhostCardRow
          icon="water"
          name={strings.today.previewGhostCardName2}
          detail={strings.today.previewGhostCardDetail2}
        />
      </Animated.View>

      <View
        style={{
          position: 'absolute',
          top: 80,
          width: CARD_WIDTH,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.colors.surface.secondary,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
          transform: [{ rotate: '2deg' }],
          shadowColor: '#000',
          shadowOpacity: theme.scheme === 'dark' ? 0.45 : 0.15,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: theme.radius.full,
              borderWidth: 2,
              borderColor: theme.colors.text.secondary,
            }}
          />
          <IconWell name="meditation" color="blue" size={32} />
          <ThemedText variant="headline" numberOfLines={1} style={{ flex: 1 }}>
            {strings.today.previewHabitName}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
          <Icon name="bell" size={13} color={theme.colors.text.secondary} />
          <ThemedText variant="footnote" color="secondary">
            {strings.today.previewHabitTime}
          </ThemedText>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-start',
            alignItems: 'center',
            gap: theme.spacing.xs,
            paddingVertical: 4,
            paddingHorizontal: theme.spacing.sm,
            borderRadius: theme.radius.full,
            backgroundColor: theme.colors.surface.elevated,
          }}
        >
          <Icon name="repeat" size={12} color={theme.colors.text.secondary} />
          <ThemedText variant="caption" color="secondary">
            {strings.today.previewHabitSchedule}
          </ThemedText>
        </View>

        <ThemedText variant="caption" color="secondary" numberOfLines={1}>
          {strings.today.previewHabitNote}
        </ThemedText>
      </View>
    </View>
  );
}
