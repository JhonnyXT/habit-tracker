import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  withTiming,
  runOnJS,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { spring as springTokens, pressScale } from '@/core/theme/motion';
import { strings } from '@/core/i18n';
import { Icon } from '@/core/ui';
import {
  HABIT_ROW_HEIGHT,
  HABIT_ROW_SEPARATOR_INSET,
} from '@/features/habits/presentation/components/habit-row';

const LONG_PRESS_MS = 220;
const LIFT_SCALE = 1.03;
const LIFT_ELEVATION = 12;
const ACTION_WIDTH = 84;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const FLING_VELOCITY = 500;

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
  slot: number;
  openId: SharedValue<string | null>;
  onTap: () => void;
  onCommit: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  accessibilityLabel: string;
  checked: boolean;
  role: 'checkbox' | 'button';
  children: React.ReactNode;
};

function DraggableRow({
  id,
  index,
  positions,
  count,
  slot,
  openId,
  onTap,
  onCommit,
  onEdit,
  onDelete,
  accessibilityLabel,
  checked,
  role,
  children,
}: DraggableRowProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const swipeable = Boolean(onEdit && onDelete);

  const top = useSharedValue(index * slot);
  const startTop = useSharedValue(0);
  const isActive = useSharedValue(false);
  const isPressed = useSharedValue(false);
  const offsetX = useSharedValue(0);
  const startX = useSharedValue(0);

  const settle = (to: number) => {
    'worklet';
    offsetX.value = reducedMotion
      ? withTiming(to, { duration: 120 })
      : withSpring(to, springTokens.snappy);
    openId.value = to === 0 ? null : id;
  };

  useAnimatedReaction(
    () => openId.value,
    (current) => {
      if (current !== id && offsetX.value !== 0) {
        offsetX.value = reducedMotion
          ? withTiming(0, { duration: 120 })
          : withSpring(0, springTokens.snappy);
      }
    },
  );

  useAnimatedReaction(
    () => positions.value[id],
    (current, previous) => {
      if (current === undefined || current === previous || isActive.value) return;
      top.value = withSpring(current * slot, springTokens.default);
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

      const target = clamp(Math.round(top.value / slot), 0, count - 1);
      const currentIndex = positions.value[id];
      if (currentIndex !== undefined && target !== currentIndex) {
        positions.value = shiftPositions(positions.value, currentIndex, target);
        runOnJS(tick)();
      }
    })
    .onEnd((event) => {
      isActive.value = false;
      const settled = positions.value[id] ?? index;

      top.value = withSpring(settled * slot, {
        ...springTokens.momentum,
        velocity: event.velocityY,
      });
      runOnJS(onCommit)();
    });

  const tap = Gesture.Tap()
    .maxDuration(LONG_PRESS_MS)
    .onEnd((_event, success) => {
      if (!success) return;
      if (offsetX.value !== 0) {
        settle(0);
        return;
      }
      runOnJS(onTap)();
    });

  const swipe = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onStart(() => {
      startX.value = offsetX.value;
    })
    .onUpdate((event) => {
      const next = startX.value + event.translationX;
      offsetX.value = clamp(next, -ACTION_WIDTH, ACTION_WIDTH);
    })
    .onEnd((event) => {
      const projected = offsetX.value + event.velocityX * 0.05;

      if (projected <= -OPEN_THRESHOLD || event.velocityX < -FLING_VELOCITY) {
        settle(-ACTION_WIDTH);
        runOnJS(tick)();
      } else if (projected >= OPEN_THRESHOLD || event.velocityX > FLING_VELOCITY) {
        settle(ACTION_WIDTH);
        runOnJS(tick)();
      } else {
        settle(0);
      }
    });

  const gesture = swipeable
    ? Gesture.Race(swipe, Gesture.Exclusive(drag, tap))
    : Gesture.Exclusive(drag, tap);

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

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }],
    backgroundColor: swipeable ? theme.colors.surface.secondary : 'transparent',
  }));

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: clamp(Math.abs(offsetX.value) / 4, 0, 1),
  }));

  const editStyle = useAnimatedStyle(() => {
    const progress = clamp(offsetX.value / ACTION_WIDTH, 0, 1);
    return { opacity: progress, transform: [{ scale: 0.7 + progress * 0.3 }] };
  });

  const deleteStyle = useAnimatedStyle(() => {
    const progress = clamp(-offsetX.value / ACTION_WIDTH, 0, 1);
    return { opacity: progress, transform: [{ scale: 0.7 + progress * 0.3 }] };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style}>
        {swipeable ? (
        <Animated.View
          pointerEvents="box-none"
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, actionsStyle]}
        >
          <Pressable
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel={`${strings.today.swipeEdit} ${accessibilityLabel}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surface.elevated,
            }}
          >
            <Animated.View style={editStyle}>
              <Icon name="edit" size={20} color={theme.colors.text.primary} />
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`${strings.today.swipeDelete} ${accessibilityLabel}`}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.state.danger,
            }}
          >
            <Animated.View style={deleteStyle}>
              <Icon name="trash" size={20} color={theme.colors.text.onSolid} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        ) : null}

        <Animated.View
          accessible
          accessibilityRole={role}
          accessibilityState={role === 'checkbox' ? { checked } : undefined}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={
            role === 'button'
              ? 'Double tap to open. Touch and hold to reorder.'
              : checked
                ? 'Double tap to mark as not done. Touch and hold to reorder.'
                : 'Double tap to mark as done. Touch and hold to reorder.'
          }
          accessibilityActions={
            swipeable
              ? [
                  { name: 'edit', label: strings.today.swipeEdit },
                  { name: 'delete', label: strings.today.swipeDelete },
                ]
              : undefined
          }
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'edit') onEdit?.();
            if (event.nativeEvent.actionName === 'delete') onDelete?.();
          }}
          style={slideStyle}
        >
          {children}
        </Animated.View>
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
  rowRole?: 'checkbox' | 'button';
  onToggle: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  slot?: number;
  separators?: boolean;
};

export function DraggableHabitList<T>({
  items,
  keyExtractor,
  renderItem,
  accessibilityLabelFor,
  isChecked,
  onToggle,
  onReorder,
  onEdit,
  onDelete,
  slot = HABIT_ROW_HEIGHT,
  separators = true,
  rowRole = 'checkbox',
}: DraggableHabitListProps<T>) {
  const ids = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
  const positions = useSharedValue<Positions>({});
  const openId = useSharedValue<string | null>(null);

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
    <View style={{ height: items.length * slot, overflow: 'hidden' }}>
      {items.map((item, index) => {
        const id = keyExtractor(item);
        return (
          <DraggableRow
            key={id}
            id={id}
            index={index}
            positions={positions}
            count={items.length}
            slot={slot}
            openId={openId}
            onTap={() => onToggle(id)}
            onCommit={commit}
            onEdit={onEdit ? () => onEdit(id) : undefined}
            onDelete={onDelete ? () => onDelete(id) : undefined}
            accessibilityLabel={accessibilityLabelFor(item)}
            checked={isChecked(item)}
            role={rowRole}
          >
            {renderItem(item)}
          </DraggableRow>
        );
      })}

      {(separators ? items.slice(1) : []).map((item, index) => (
        <View
          key={`separator-${keyExtractor(item)}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: (index + 1) * slot,
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
