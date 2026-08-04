import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';

import { useAppTheme } from '@/core/theme';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [trackWidth, setTrackWidth] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentWidth = trackWidth > 0 ? trackWidth / options.length : 0;

  const offset = useSharedValue(0);
  const settled = useSharedValue(false);

  useEffect(() => {
    const target = selectedIndex * segmentWidth;

    if (!settled.value) {
      offset.value = target;
      settled.value = segmentWidth > 0;
      return;
    }

    offset.value = reducedMotion
      ? withTiming(target, { duration: theme.motion.duration.instant })
      : withSpring(target, theme.motion.spring.snappy);
  }, [selectedIndex, segmentWidth, reducedMotion, offset, settled, theme.motion]);

  const pillStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    transform: [{ translateX: offset.value }],
  }));

  const onLayout = (event: LayoutChangeEvent) =>
    setTrackWidth(event.nativeEvent.layout.width - theme.spacing.xs);

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: 'row',
        padding: theme.spacing.xxs,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface.elevated,
      }}
    >
      {trackWidth > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: theme.spacing.xxs,
              left: theme.spacing.xxs,
              bottom: theme.spacing.xxs,
              borderRadius: theme.radius.sm,
              backgroundColor: theme.colors.surface.secondary,
            },
            pillStyle,
          ]}
        />
      ) : null}

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            activeScale={0.97}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.sm,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ThemedText
              variant="subheadline"
              style={{
                fontWeight: selected ? '600' : '400',
                color: selected ? theme.colors.text.primary : theme.colors.text.secondary,
              }}
            >
              {option.label}
            </ThemedText>
          </PressableScale>
        );
      })}
    </View>
  );
}
