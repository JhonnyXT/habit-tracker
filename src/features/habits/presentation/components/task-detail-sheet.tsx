import { Modal, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

import { useAppTheme, type HabitColorToken } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, Icon, PressableScale, Button, useModalProgress, useRetainedValue } from '@/core/ui';
import { formatDeadline } from '@/features/habits/presentation/format';
import type { TaskWithState } from '@/features/habits/domain/use-cases/get-habit-tasks';

type TaskDetailSheetProps = {
  task: TaskWithState | null;
  habitColor: HabitColorToken;
  onClose: () => void;
  onEdit: (task: TaskWithState) => void;
};

export function TaskDetailSheet({ task, habitColor, onClose, onEdit }: TaskDetailSheetProps) {
  const theme = useAppTheme();
  const visible = task !== null;
  const displayTask = useRetainedValue(task);
  const color = displayTask?.color ?? habitColor;
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.92, 1]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.surface.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
          },
          scrimStyle,
        ]}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        {displayTask ? (
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                width: '100%',
                maxWidth: 340,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface.secondary,
                padding: theme.spacing.lg,
                gap: theme.spacing.md,
              },
              cardStyle,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.habit[color].solid,
                }}
              />
              <ThemedText variant="title" style={{ flex: 1 }}>
                {displayTask.name}
              </ThemedText>
              <PressableScale
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={strings.todayTasks.detailClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: theme.radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.surface.elevated,
                }}
              >
                <Icon name="close" size={14} color={theme.colors.text.secondary} />
              </PressableScale>
            </View>

            {displayTask.deadline || displayTask.urgent || displayTask.pinned ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {displayTask.deadline ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                    <Icon name="clock" size={13} color={theme.colors.text.secondary} />
                    <ThemedText variant="footnote" color="secondary">
                      {formatDeadline(displayTask.deadline)}
                    </ThemedText>
                  </View>
                ) : null}
                {displayTask.pinned ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs }}>
                    <Icon name="pin" size={13} color={theme.colors.text.secondary} />
                    <ThemedText variant="footnote" color="secondary">
                      {strings.todayTasks.detailPinned}
                    </ThemedText>
                  </View>
                ) : null}
                {displayTask.urgent ? (
                  <ThemedText variant="footnote" style={{ color: theme.colors.state.danger }}>
                    {strings.todayTasks.detailUrgent}
                  </ThemedText>
                ) : null}
              </View>
            ) : null}

            <ThemedText variant="body" color="secondary">
              {displayTask.notes && displayTask.notes.length > 0
                ? displayTask.notes
                : strings.todayTasks.detailNoNotes}
            </ThemedText>

            <Button
              label={strings.todayTasks.detailEdit}
              icon="edit"
              variant="secondary"
              onPress={() => onEdit(displayTask)}
            />
          </Animated.View>
        ) : null}
      </Animated.View>
    </Modal>
  );
}
