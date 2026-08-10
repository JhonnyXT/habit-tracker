import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  Icon,
  PressableScale,
  Chip,
  Button,
  TimePickerModal,
  useModalProgress,
  useRetainedValue,
} from '@/core/ui';
import { DeadlineCalendar } from '@/features/habits/presentation/components/deadline-calendar';
import { useHabitsStore } from '@/features/habits/presentation/store';
import { formatDeadline } from '@/features/habits/presentation/format';
import { startOfMonth } from '@/features/habits/domain/calendar';
import { today as todayISODate, fromISODate, toISODate, type ISODate } from '@/features/habits/domain/date';
import { MAX_TASK_NAME_LENGTH, MAX_TASK_NOTES_LENGTH } from '@/features/habits/domain/entities/task';
import type { TaskWithState } from '@/features/habits/domain/use-cases/get-habit-tasks';

const time12hFormatter = new Intl.DateTimeFormat('es', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function formatTime12h(date: Date): string {
  return time12hFormatter.format(date);
}

function timeFromDeadline(deadline: Date | null): Date {
  const date = new Date();
  if (deadline) date.setHours(deadline.getHours(), deadline.getMinutes(), 0, 0);
  else date.setHours(9, 0, 0, 0);
  return date;
}

type TaskEditSheetProps = {
  task: TaskWithState | null;
  onClose: () => void;
};

export function TaskEditSheet({ task, onClose }: TaskEditSheetProps) {
  const theme = useAppTheme();
  const editTask = useHabitsStore((state) => state.editTask);

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [deadlineReveal, setDeadlineReveal] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<ISODate | null>(null);
  const [deadlineMonth, setDeadlineMonth] = useState<ISODate>(() => startOfMonth(todayISODate()));
  const [deadlineTime, setDeadlineTime] = useState(() => timeFromDeadline(null));
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) return;
    setName(task.name);
    setNotes(task.notes ?? '');
    setUrgent(task.urgent);
    setPinned(task.pinned);
    setDeadlineReveal(false);
    if (task.deadline) {
      const date = toISODate(task.deadline);
      setDeadlineDate(date);
      setDeadlineMonth(startOfMonth(date));
      setDeadlineTime(timeFromDeadline(task.deadline));
    } else {
      setDeadlineDate(null);
      setDeadlineMonth(startOfMonth(todayISODate()));
      setDeadlineTime(timeFromDeadline(null));
    }
  }, [task]);

  const visible = task !== null;
  const displayTask = useRetainedValue(task);
  const canSave = name.trim().length > 0;
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  const onSave = async () => {
    if (!displayTask || !canSave) return;
    setSaving(true);

    const deadline = deadlineDate
      ? (() => {
          const date = fromISODate(deadlineDate);
          date.setHours(deadlineTime.getHours(), deadlineTime.getMinutes(), 0, 0);
          return date;
        })()
      : null;

    const ok = await editTask(displayTask.habitId, displayTask.id, name, {
      urgent,
      pinned,
      deadline,
      notes,
    });
    setSaving(false);
    if (!ok) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          { flex: 1, backgroundColor: theme.colors.surface.scrim, justifyContent: 'flex-end' },
          scrimStyle,
        ]}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          pointerEvents="box-none"
        >
        {displayTask ? (
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                maxHeight: '85%',
                borderTopLeftRadius: theme.radius.xl,
                borderTopRightRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface.primary,
                borderWidth: 1.5,
                borderBottomWidth: 0,
                borderColor: theme.colors.accent.glow,
              },
              cardStyle,
            ]}
          >
            <View style={{ alignItems: 'center', paddingTop: theme.spacing.sm }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.border.default,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: theme.spacing.md,
                paddingTop: theme.spacing.md,
                paddingBottom: theme.spacing.sm,
              }}
            >
              <PressableScale
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={strings.form.close}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.surface.secondary,
                }}
              >
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {strings.form.close}
                </ThemedText>
              </PressableScale>

              <ThemedText variant="headline">{strings.form.taskEditTitle}</ThemedText>

              <PressableScale
                onPress={onSave}
                disabled={!canSave || saving}
                accessibilityRole="button"
                accessibilityLabel={strings.form.done}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.surface.secondary,
                  opacity: !canSave || saving ? 0.5 : 1,
                }}
              >
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {strings.form.done}
                </ThemedText>
              </PressableScale>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.lg }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View
                style={{
                  borderRadius: theme.radius.xl,
                  backgroundColor: theme.colors.surface.secondary,
                  padding: theme.spacing.md,
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: theme.radius.full,
                      borderWidth: 1.5,
                      borderColor: theme.colors.border.default,
                    }}
                  />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={strings.form.taskNamePlaceholder}
                    placeholderTextColor={theme.colors.text.secondary}
                    maxLength={MAX_TASK_NAME_LENGTH}
                    accessibilityLabel={strings.a11y.taskName}
                    returnKeyType="done"
                    style={{
                      flex: 1,
                      ...theme.typography.headline,
                      color: theme.colors.text.primary,
                      padding: 0,
                    }}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.sm }}>
                  <View style={{ marginTop: 2 }}>
                    <Icon name="notes" size={18} color={theme.colors.text.secondary} />
                  </View>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={strings.form.taskNotesPlaceholder}
                    placeholderTextColor={theme.colors.text.secondary}
                    maxLength={MAX_TASK_NOTES_LENGTH}
                    multiline
                    accessibilityLabel={strings.a11y.taskNotes}
                    style={{
                      flex: 1,
                      ...theme.typography.footnote,
                      color: theme.colors.text.secondary,
                      padding: 0,
                      minHeight: 40,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>
              </View>

              <View style={{ gap: theme.spacing.sm }}>
                <Chip
                  label={
                    deadlineDate
                      ? formatDeadline(
                          (() => {
                            const date = fromISODate(deadlineDate);
                            date.setHours(deadlineTime.getHours(), deadlineTime.getMinutes(), 0, 0);
                            return date;
                          })(),
                        )
                      : strings.form.taskDeadline
                  }
                  icon="calendar"
                  selected={deadlineReveal}
                  onPress={() => setDeadlineReveal((current) => !current)}
                />

                {deadlineReveal ? (
                  <View style={{ gap: theme.spacing.md }}>
                    <View
                      style={{
                        borderRadius: theme.radius.lg,
                        backgroundColor: theme.colors.surface.secondary,
                        padding: theme.spacing.md,
                      }}
                    >
                      <DeadlineCalendar
                        month={deadlineMonth}
                        onMonthChange={setDeadlineMonth}
                        selected={deadlineDate}
                        onSelectDay={(date) => {
                          Haptics.selectionAsync();
                          setDeadlineDate(date);
                        }}
                      />
                    </View>

                    {deadlineDate ? (
                      <>
                        <PressableScale
                          onPress={() => setTimePickerVisible(true)}
                          accessibilityRole="button"
                          accessibilityLabel={strings.form.time}
                          activeScale={0.99}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing.sm,
                            paddingHorizontal: theme.spacing.md,
                            minHeight: 52,
                            borderRadius: theme.radius.lg,
                            backgroundColor: theme.colors.surface.secondary,
                          }}
                        >
                          <Icon name="clock" size={16} color={theme.colors.text.secondary} />
                          <ThemedText variant="body" style={{ flex: 1 }}>
                            {strings.form.time}
                          </ThemedText>
                          <View
                            style={{
                              backgroundColor: theme.colors.surface.elevated,
                              borderRadius: theme.radius.sm,
                              paddingHorizontal: theme.spacing.sm,
                              paddingVertical: 4,
                            }}
                          >
                            <ThemedText variant="body" style={{ fontWeight: '500' }}>
                              {formatTime12h(deadlineTime)}
                            </ThemedText>
                          </View>
                        </PressableScale>

                        <PressableScale
                          onPress={() => {
                            Haptics.selectionAsync();
                            setDeadlineDate(null);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={strings.form.taskDeadlineClear}
                        >
                          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xs }}>
                            <ThemedText variant="footnote" style={{ color: theme.colors.state.danger }}>
                              {strings.form.taskDeadlineClear}
                            </ThemedText>
                          </View>
                        </PressableScale>
                      </>
                    ) : null}
                  </View>
                ) : null}
              </View>

              <View
                style={{
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.surface.secondary,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 52,
                  }}
                >
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {strings.form.taskUrgent}
                  </ThemedText>
                  <Switch
                    value={urgent}
                    onValueChange={setUrgent}
                    accessibilityLabel={strings.form.taskUrgent}
                    trackColor={{ true: theme.colors.accent.default }}
                  />
                </View>
                <View style={{ height: 1, backgroundColor: theme.colors.border.default }} />
                <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.xs }}>
                  <ThemedText variant="footnote" color="secondary">
                    {strings.form.taskUrgentNote}
                  </ThemedText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 52,
                  }}
                >
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {strings.form.taskPinned}
                  </ThemedText>
                  <Switch
                    value={pinned}
                    onValueChange={setPinned}
                    accessibilityLabel={strings.form.taskPinned}
                    trackColor={{ true: theme.colors.accent.default }}
                  />
                </View>
              </View>

              <Button
                label={strings.form.save}
                icon="check"
                onPress={onSave}
                disabled={!canSave || saving}
                accessibilityLabel={strings.a11y.saveHabit}
              />
            </ScrollView>
          </Animated.View>
        ) : null}
        </KeyboardAvoidingView>
      </Animated.View>

      <TimePickerModal
        visible={timePickerVisible}
        value={deadlineTime}
        onCancel={() => setTimePickerVisible(false)}
        onConfirm={(date) => {
          setDeadlineTime(date);
          setTimePickerVisible(false);
        }}
      />
    </Modal>
  );
}
