import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { spring as springTokens, pressScale, duration as durationTokens } from '@/core/theme/motion';
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
  onDragStart: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  accessibilityLabel: string;
  checked: boolean;
  role: 'checkbox' | 'button';
  accessibleRow: boolean;
  children: React.ReactNode;

  expandedIdSV: SharedValue<string | null>;
  expandedPosSV: SharedValue<number>;
  extraHeightSV: SharedValue<number>;
  contentVisible: boolean;
  renderExpanded?: () => React.ReactNode;
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
  onDragStart,
  onEdit,
  onDelete,
  accessibilityLabel,
  checked,
  role,
  accessibleRow,
  children,
  expandedIdSV,
  expandedPosSV,
  extraHeightSV,
  contentVisible,
  renderExpanded,
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
    () => ({
      pos: positions.value[id],
      expandedPos: expandedPosSV.value,
      extra: extraHeightSV.value,
    }),
    (current, previous) => {
      if (current.pos === undefined || isActive.value) return;
      if (previous && current.pos === previous.pos && current.extra === previous.extra) return;
      const shift = current.expandedPos !== -1 && current.pos > current.expandedPos ? current.extra : 0;
      top.value = withSpring(current.pos * slot + shift, springTokens.default);
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
      runOnJS(onDragStart)();
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
    const isExpandedRow = expandedIdSV.value === id;
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      top: top.value,
      height: isExpandedRow ? slot + extraHeightSV.value : slot,
      overflow: 'hidden',
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

  const onExpandedLayout = (event: { nativeEvent: { layout: { height: number } } }) => {
    if (expandedIdSV.value !== id) return;
    const nextHeight = event.nativeEvent.layout.height;
    const spring = withSpring(nextHeight, springTokens.snappy);
    extraHeightSV.value =
      nextHeight < extraHeightSV.value ? withDelay(durationTokens.listItemExit, spring) : spring;
  };

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
              backgroundColor: theme.colors.surface.secondary,
            }}
          >
            <Animated.View
              style={[
                editStyle,
                {
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.accent.subtle,
                },
              ]}
            >
              <Icon name="edit" size={18} color={theme.colors.accent.default} />
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
              backgroundColor: theme.colors.state.dangerSubtle,
            }}
          >
            <Animated.View
              style={[
                deleteStyle,
                {
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.state.dangerSubtle,
                },
              ]}
            >
              <Icon name="trash" size={18} color={theme.colors.state.danger} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        ) : null}

        <Animated.View
          accessible={accessibleRow}
          accessibilityRole={accessibleRow ? role : undefined}
          accessibilityState={accessibleRow && role === 'checkbox' ? { checked } : undefined}
          accessibilityLabel={accessibleRow ? accessibilityLabel : undefined}
          accessibilityHint={
            !accessibleRow
              ? undefined
              : role === 'button'
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
          {contentVisible && renderExpanded ? (
            <View onLayout={onExpandedLayout}>{renderExpanded()}</View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

type DraggableHabitListProps<T> = {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, state: { expanded: boolean }) => React.ReactNode;

  accessibilityLabelFor: (item: T) => string;
  isChecked: (item: T) => boolean;
  rowRole?: 'checkbox' | 'button';
  onToggle: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  slot?: number;
  separators?: boolean;

  canExpand?: (item: T) => boolean;
  renderExpanded?: (item: T) => React.ReactNode;
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
  canExpand,
  renderExpanded,
}: DraggableHabitListProps<T>) {
  const ids = useMemo(() => items.map(keyExtractor), [items, keyExtractor]);
  const positions = useSharedValue<Positions>({});
  const openId = useSharedValue<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const expandedIdSV = useSharedValue<string | null>(null);
  const expandedPosSV = useSharedValue(-1);
  const extraHeightSV = useSharedValue(0);

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

  const collapse = useCallback(() => {
    setExpandedId(null);
    expandedIdSV.value = null;
    expandedPosSV.value = -1;
    extraHeightSV.value = withSpring(0, springTokens.snappy, (finished) => {
      if (finished) runOnJS(setContentId)(null);
    });
  }, [expandedIdSV, expandedPosSV, extraHeightSV]);

  const onToggleExpand = useCallback(
    (id: string) => {
      if (expandedId === id) {
        collapse();
        return;
      }
      setExpandedId(id);
      setContentId(id);
      expandedIdSV.value = id;
      expandedPosSV.value = positions.value[id] ?? -1;
      extraHeightSV.value = 0;
    },
    [expandedId, collapse, expandedIdSV, expandedPosSV, extraHeightSV, positions],
  );

  const itemCount = items.length;
  const containerStyle = useAnimatedStyle(() => ({
    height: itemCount * slot + extraHeightSV.value,
  }));

  return (
    <Animated.View style={containerStyle}>
      {items.map((item, index) => {
        const id = keyExtractor(item);
        const itemCanExpand = (canExpand?.(item) ?? false) || expandedId === id;
        const accessibleRow = canExpand ? itemCanExpand : true;
        return (
          <DraggableRow
            key={id}
            id={id}
            index={index}
            positions={positions}
            count={items.length}
            slot={slot}
            openId={openId}
            onTap={() => (itemCanExpand ? onToggleExpand(id) : onToggle(id))}
            onCommit={commit}
            onDragStart={collapse}
            onEdit={onEdit ? () => onEdit(id) : undefined}
            onDelete={onDelete ? () => onDelete(id) : undefined}
            accessibilityLabel={accessibilityLabelFor(item)}
            checked={isChecked(item)}
            role={itemCanExpand ? 'button' : rowRole}
            accessibleRow={accessibleRow}
            expandedIdSV={expandedIdSV}
            expandedPosSV={expandedPosSV}
            extraHeightSV={extraHeightSV}
            contentVisible={contentId === id}
            renderExpanded={renderExpanded ? () => renderExpanded(item) : undefined}
          >
            {renderItem(item, { expanded: expandedId === id })}
          </DraggableRow>
        );
      })}

      {(separators ? items.slice(1) : []).map((item, index) => (
        <Separator
          key={`separator-${keyExtractor(item)}`}
          slotIndex={index + 1}
          slot={slot}
          expandedPosSV={expandedPosSV}
          extraHeightSV={extraHeightSV}
          color={theme.colors.border.default}
        />
      ))}
    </Animated.View>
  );
}

type SeparatorProps = {
  slotIndex: number;
  slot: number;
  expandedPosSV: SharedValue<number>;
  extraHeightSV: SharedValue<number>;
  color: string;
};

function Separator({ slotIndex, slot, expandedPosSV, extraHeightSV, color }: SeparatorProps) {
  const style = useAnimatedStyle(() => {
    const shift = expandedPosSV.value !== -1 && slotIndex > expandedPosSV.value ? extraHeightSV.value : 0;
    return { top: slotIndex * slot + shift };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: HABIT_ROW_SEPARATOR_INSET,
          right: 0,
          height: 1,
          backgroundColor: color,
          opacity: 0.5,
        },
        style,
      ]}
    />
  );
}
