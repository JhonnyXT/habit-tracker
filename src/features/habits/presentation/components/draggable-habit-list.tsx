import { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  runOnJS,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { spring as springTokens, pressScale } from '@/core/theme/motion';
import {
  HABIT_ROW_HEIGHT,
  HABIT_ROW_SEPARATOR_INSET,
} from '@/features/habits/presentation/components/habit-row';

const SLOT = HABIT_ROW_HEIGHT;
const LONG_PRESS_MS = 220;
const LIFT_SCALE = 1.03;
const LIFT_ELEVATION = 12;

type Positions = Record<string, number>;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function shiftPositions(positions: Positions, from: number, to: number): Positions {
  'worklet';
  const next: Positions = {};
  for (const id in positions) {
    const at = positions[id];
    if (at === from) next[id] = to;
    else if (from < to && at > from && at <= to) next[id] = at - 1;
    else if (from > to && at < from && at >= to) next[id] = at + 1;
    else next[id] = at;
  }
  return next;
}

type DraggableRowProps = {
  id: string;
  index: number;
  positions: SharedValue<Positions>;
  count: number;
  onTap: () => void;
  onCommit: () => void;
  accessibilityLabel: string;
  checked: boolean;
  children: React.ReactNode;
};

function DraggableRow({
  id,
  index,
  positions,
  count,
  onTap,
  onCommit,
  accessibilityLabel,
  checked,
  children,
}: DraggableRowProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();

  const top = useSharedValue(index * SLOT);
  const startTop = useSharedValue(0);
  const isActive = useSharedValue(false);
  const isPressed = useSharedValue(false);

  useAnimatedReaction(
    () => positions.value[id],
    (current, previous) => {
      if (current === undefined || current === previous || isActive.value) return;
      top.value = withSpring(current * SLOT, springTokens.default);
    },
  );

  const impact = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const tick = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const drag = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .onBegin(() => {
      isPressed.value = true;
    })
    .onFinalize(() => {
      isPressed.value = false;
    })
    .onStart(() => {
      isActive.value = true;
      startTop.value = top.value;

      runOnJS(impact)();
    })
    .onUpdate((event) => {
      top.value = startTop.value + event.translationY;

      const target = clamp(Math.round(top.value / SLOT), 0, count - 1);
      const currentIndex = positions.value[id];
      if (currentIndex !== undefined && target !== currentIndex) {
        positions.value = shiftPositions(positions.value, currentIndex, target);
        runOnJS(tick)();
      }
    })
    .onEnd((event) => {
      isActive.value = false;
      const settled = positions.value[id] ?? index;

      top.value = withSpring(settled * SLOT, {
        ...springTokens.momentum,
        velocity: event.velocityY,
      });
      runOnJS(onCommit)();
    });

  const tap = Gesture.Tap()
    .maxDuration(LONG_PRESS_MS)
    .onEnd((_event, success) => {
      if (success) runOnJS(onTap)();
    });

  const gesture = Gesture.Exclusive(drag, tap);

  const style = useAnimatedStyle(() => {
    const lift = isActive.value ? 1 : 0;
    const restingScale = isPressed.value ? pressScale : 1;
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      top: top.value,
      zIndex: isActive.value ? 10 : 0,
      transform: [
        {
          scale: reducedMotion
            ? 1
            : withSpring(isActive.value ? LIFT_SCALE : restingScale, springTokens.snappy),
        },
      ],
      shadowColor: '#000',
      shadowOpacity: withSpring(lift * (theme.scheme === 'dark' ? 0.5 : 0.18)),
      shadowRadius: withSpring(lift * 18),
      shadowOffset: { width: 0, height: withSpring(lift * 8) },
      elevation: withSpring(lift * LIFT_ELEVATION, springTokens.snappy),
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={
          checked
            ? 'Double tap to mark as not done. Touch and hold to reorder.'
            : 'Double tap to mark as done. Touch and hold to reorder.'
        }
        style={style}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

type DraggableHabitListProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;

  accessibilityLabelFor: (item: T) => string;
  isChecked: (item: T) => boolean;
  onToggle: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

export function DraggableHabitList<T>({
  items,
  keyExtractor,
  renderItem,
  accessibilityLabelFor,
  isChecked,
  onToggle,
  onReorder,
}: DraggableHabitListProps<T>) {
  const ids = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
  const positions = useSharedValue<Positions>({});

  const idKey = ids.join('|');
  useEffect(() => {
    const next: Positions = {};
    ids.forEach((id, index) => {
      next[id] = index;
    });
    positions.value = next;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  const theme = useAppTheme();

  const commit = useCallback(() => {
    const current = positions.value;
    const ordered = Object.keys(current).sort((a, b) => current[a] - current[b]);
    if (ordered.length > 0) onReorder(ordered);
  }, [positions, onReorder]);

  return (
    <View style={{ height: items.length * SLOT }}>
      {items.map((item, index) => {
        const id = keyExtractor(item);
        return (
          <DraggableRow
            key={id}
            id={id}
            index={index}
            positions={positions}
            count={items.length}
            onTap={() => onToggle(id)}
            onCommit={commit}
            accessibilityLabel={accessibilityLabelFor(item)}
            checked={isChecked(item)}
          >
            {renderItem(item)}
          </DraggableRow>
        );
      })}

      {items.slice(1).map((item, index) => (
        <View
          key={`separator-${keyExtractor(item)}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: (index + 1) * SLOT,
            left: HABIT_ROW_SEPARATOR_INSET,
            right: 0,
            height: 1,
            backgroundColor: theme.colors.border.default,
          }}
        />
      ))}
    </View>
  );
}
