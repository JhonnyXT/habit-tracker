import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useReducedMotion,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme, type HabitColorToken } from '@/core/theme';
import { spring as springTokens, duration as durationTokens } from '@/core/theme/motion';
import { strings } from '@/core/i18n';
import { ThemedText, Icon, GestureTap, CompletionCheck } from '@/core/ui';
import { formatDeadline } from '@/features/habits/presentation/format';
import type { TaskWithState } from '@/features/habits/domain/use-cases/get-habit-tasks';

const ACTION_WIDTH = 72;
const OPEN_THRESHOLD = ACTION_WIDTH / 2;
const FLING_VELOCITY = 500;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

type TaskCardProps = {
  task: TaskWithState;
  habitColor: HabitColorToken;
  onToggle: (taskId: string) => void;
  onPress: (task: TaskWithState) => void;
  onEdit: (task: TaskWithState) => void;
  onDelete: (task: TaskWithState) => void;
  removing?: boolean;
};

const exiting = FadeOut.duration(durationTokens.listItemExit);
const layout = LinearTransition.springify()
  .dampingRatio(springTokens.snappy.dampingRatio)
  .duration(springTokens.snappy.duration);

export function TaskCard({
  task,
  habitColor,
  onToggle,
  onPress,
  onEdit,
  onDelete,
  removing = false,
}: TaskCardProps) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const cardColor = task.color ?? habitColor;
  const offsetX = useSharedValue(0);
  const startX = useSharedValue(0);
  const removeProgress = useSharedValue(0);

  useEffect(() => {
    removeProgress.value = removing
      ? withTiming(1, { duration: durationTokens.listItemExit })
      : 0;
  }, [removing, removeProgress]);

  const removeStyle = useAnimatedStyle(() => ({
    opacity: 1 - removeProgress.value,
    transform: [{ scale: 1 - removeProgress.value * 0.06 }],
  }));

  const tick = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const settle = useCallback(
    (to: number) => {
      'worklet';
      offsetX.value = reducedMotion ? withTiming(to, { duration: 120 }) : withSpring(to, springTokens.snappy);
    },
    [offsetX, reducedMotion],
  );

  const swipe = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onStart(() => {
      startX.value = offsetX.value;
    })
    .onUpdate((event) => {
      offsetX.value = clamp(startX.value + event.translationX, -ACTION_WIDTH, ACTION_WIDTH);
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

  const closeIfOpen = () => {
    if (offsetX.value !== 0) settle(0);
  };

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

  return (
    <Animated.View exiting={exiting} layout={layout} style={removeStyle} pointerEvents={removing ? 'none' : 'auto'}>
      <View style={{ borderRadius: theme.radius.xl, overflow: 'hidden' }}>
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }, actionsStyle]}
        >
          <GestureTap
            onPress={() => {
              closeIfOpen();
              onEdit(task);
            }}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.editTask}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={[
                editStyle,
                {
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.accent.subtle,
                },
              ]}
            >
              <Icon name="edit" size={18} color={theme.colors.accent.default} />
            </Animated.View>
          </GestureTap>

          <GestureTap
            onPress={() => {
              closeIfOpen();
              onDelete(task);
            }}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.deleteTask}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: ACTION_WIDTH,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={[
                deleteStyle,
                {
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.state.dangerSubtle,
                },
              ]}
            >
              <Icon name="trash" size={18} color={theme.colors.state.danger} />
            </Animated.View>
          </GestureTap>
        </Animated.View>

        <GestureDetector gesture={swipe}>
          <Animated.View
            style={[
              {
                backgroundColor: theme.colors.habit[cardColor].tint,
                borderRadius: theme.radius.xl,
                padding: theme.spacing.md,
              },
              slideStyle,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
              <GestureTap
                onPress={() => onToggle(task.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completedToday }}
                accessibilityLabel={strings.a11y.toggleTask(task.name)}
                style={{ marginTop: 2 }}
              >
                <CompletionCheck completed={task.completedToday} color={cardColor} size={22} />
              </GestureTap>

              <GestureTap
                onPress={() => onPress(task)}
                accessibilityRole="button"
                accessibilityLabel={strings.a11y.viewTaskDetail(task.name)}
                style={{ flex: 1, gap: theme.spacing.xs }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  {task.pinned ? (
                    <View style={{ marginRight: theme.spacing.xxs, marginTop: 3 }}>
                      <Icon name="pin" size={14} color={theme.colors.text.secondary} />
                    </View>
                  ) : null}
                  <ThemedText
                    variant="body"
                    style={{
                      flex: 1,
                      opacity: task.completedToday ? 0.5 : 1,
                      textDecorationLine: task.completedToday ? 'line-through' : 'none',
                    }}
                  >
                    {task.name}
                  </ThemedText>
                </View>

                {task.deadline ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                    <Icon name="clock" size={13} color={theme.colors.text.secondary} />
                    <ThemedText variant="footnote" color="secondary">
                      {formatDeadline(task.deadline)}
                    </ThemedText>
                  </View>
                ) : null}
              </GestureTap>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}
