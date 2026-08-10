import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme, type HabitColorToken } from '@/core/theme';
import { duration as durationTokens } from '@/core/theme/motion';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  PressableScale,
  Icon,
  IconWell,
  Chip,
  TimePickerModal,
  useModalProgress,
  useSuccessOverlayStore,
  type IconName,
} from '@/core/ui';
import { getUseCases } from '@/core/di';
import { DeadlineCalendar } from '@/features/habits/presentation/components/deadline-calendar';
import { HabitCustomizeSheet } from '@/features/habits/presentation/components/habit-customize-sheet';
import { TaskCustomizeSheet } from '@/features/habits/presentation/components/task-customize-sheet';
import { useHabitsStore } from '@/features/habits/presentation/store';
import { useCreateSheetStore } from '@/features/habits/presentation/create-sheet-store';
import { formatDeadline } from '@/features/habits/presentation/format';
import { MAX_HABIT_NAME_LENGTH, type Schedule, type Weekday } from '@/features/habits/domain/entities/habit';
import { MAX_TASK_NAME_LENGTH, MAX_TASK_NOTES_LENGTH } from '@/features/habits/domain/entities/task';
import { startOfMonth } from '@/features/habits/domain/calendar';
import { today as todayISODate, fromISODate, type ISODate } from '@/features/habits/domain/date';
import type { HabitSummary } from '@/features/habits/domain/use-cases/get-habits';
import {
  DEFAULT_REMINDER_TIME,
  parseClockTime,
  toClockTime,
  type ClockTime,
} from '@/features/reminders/domain/entities/reminder';
import type { NotificationPermission } from '@/features/reminders/domain/notification-scheduler';

type ListPickerModalProps = {
  visible: boolean;
  habits: HabitSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function ListPickerModal({ visible, habits, selectedId, onSelect, onClose }: ListPickerModalProps) {
  const theme = useAppTheme();
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: theme.colors.surface.scrim,
            justifyContent: 'flex-end',
            padding: theme.spacing.md,
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
        <Animated.View
          accessibilityViewIsModal
          style={[
            {
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              overflow: 'hidden',
              maxHeight: '60%',
            },
            cardStyle,
          ]}
        >
          <ScrollView>
            {habits.map((entry, index) => {
              const selected = entry.habit.id === selectedId;
              return (
                <PressableScale
                  key={entry.habit.id}
                  onPress={() => onSelect(entry.habit.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={entry.habit.name}
                  activeScale={0.99}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 56,
                    backgroundColor: selected ? theme.colors.accent.subtle : 'transparent',
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.border.default,
                  }}
                >
                  <IconWell name={entry.habit.icon} color={entry.habit.color} size={32} />
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {entry.habit.name}
                  </ThemedText>
                  {selected ? <Icon name="check" size={16} color={theme.colors.accent.default} /> : null}
                </PressableScale>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function timeFromClock(time: ClockTime): Date {
  const { hour, minute } = parseClockTime(time);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

const time12hFormatter = new Intl.DateTimeFormat('es', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function formatTime12h(date: Date): string {
  return time12hFormatter.format(date);
}

const initialSchedule: Schedule['type'] = 'daily';

export function CreateSheet() {
  const theme = useAppTheme();
  const visible = useCreateSheetStore((state) => state.visible);
  const close = useCreateSheetStore((state) => state.close);
  const create = useHabitsStore((state) => state.create);
  const createTask = useHabitsStore((state) => state.createTask);
  const habitsList = useHabitsStore((state) => state.habits);

  const [mode, setMode] = useState<'habit' | 'task'>('habit');

  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('running');
  const [color, setColor] = useState<HabitColorToken>('blue');
  const [scheduleType, setScheduleType] = useState<Schedule['type']>(initialSchedule);
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(['mon', 'wed', 'fri']);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => timeFromClock(DEFAULT_REMINDER_TIME));
  const [preReminderEnabled, setPreReminderEnabled] = useState(false);
  const [followupReminderEnabled, setFollowupReminderEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const [habitCustomizeVisible, setHabitCustomizeVisible] = useState(false);

  const [taskName, setTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskHabitId, setTaskHabitId] = useState<string | null>(null);
  const [taskUrgent, setTaskUrgent] = useState(false);
  const [taskPinned, setTaskPinned] = useState(false);
  const [taskDeadlineDate, setTaskDeadlineDate] = useState<ISODate | null>(null);
  const [taskDeadlineMonth, setTaskDeadlineMonth] = useState<ISODate>(() => startOfMonth(todayISODate()));
  const [taskDeadlineTime, setTaskDeadlineTime] = useState(() => timeFromClock('09:00'));
  const [taskDeadlineVisible, setTaskDeadlineVisible] = useState(false);
  const [taskDeadlineTimePickerVisible, setTaskDeadlineTimePickerVisible] = useState(false);
  const [taskCustomizeVisible, setTaskCustomizeVisible] = useState(false);
  const [listPickerVisible, setListPickerVisible] = useState(false);

  const { shouldRender, progress } = useModalProgress(visible);
  const deadlineModal = useModalProgress(taskDeadlineVisible);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      const useCases = await getUseCases();
      const current = await useCases.getNotificationPermission();
      if (!cancelled) setPermission(current);
    })();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const onScheduleTypeChange = (value: Schedule['type']) => {
    setScheduleType(value);
    if (value !== 'daily') {
      setPreReminderEnabled(false);
      setFollowupReminderEnabled(false);
    }
  };

  const reset = () => {
    setMode('habit');
    setName('');
    setIcon('running');
    setColor('blue');
    setScheduleType('daily');
    setSelectedDays(['mon', 'wed', 'fri']);
    setTimesPerWeek(3);
    setReminderEnabled(false);
    setReminderTime(timeFromClock(DEFAULT_REMINDER_TIME));
    setPreReminderEnabled(false);
    setFollowupReminderEnabled(false);
    setTaskName('');
    setTaskNotes('');
    setTaskHabitId(null);
    setTaskUrgent(false);
    setTaskPinned(false);
    setTaskDeadlineDate(null);
    setTaskDeadlineMonth(startOfMonth(todayISODate()));
    setTaskDeadlineTime(timeFromClock('09:00'));
  };

  const onClose = () => {
    close();
    reset();
  };

  const finishCreate = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const message = mode === 'task' ? strings.form.taskCreatedTitle : strings.form.habitCreatedTitle;
    close();
    setTimeout(() => {
      reset();
      useSuccessOverlayStore.getState().show(message);
    }, durationTokens.default);
  };

  const onToggleReminder = async (enabled: boolean) => {
    Haptics.selectionAsync();
    setReminderEnabled(enabled);
    if (!enabled) return;
    const useCases = await getUseCases();
    setPermission(await useCases.requestNotificationPermission());
  };

  const buildSchedule = (): Schedule => {
    switch (scheduleType) {
      case 'weekdays':
        return { type: 'weekdays', days: selectedDays };
      case 'timesPerWeek':
        return { type: 'timesPerWeek', count: timesPerWeek };
      default:
        return { type: 'daily' };
    }
  };

  const canSaveHabit = name.trim().length > 0 && !(scheduleType === 'weekdays' && selectedDays.length === 0);
  const canSaveTask = taskName.trim().length > 0 && taskHabitId !== null;
  const canSave = mode === 'task' ? canSaveTask : canSaveHabit;

  const selectedTaskHabit = habitsList.find((entry) => entry.habit.id === taskHabitId) ?? null;

  const onCreate = async () => {
    if (!canSave) return;

    if (mode === 'task') {
      if (!taskHabitId) return;
      const deadline = taskDeadlineDate
        ? (() => {
            const date = fromISODate(taskDeadlineDate);
            date.setHours(taskDeadlineTime.getHours(), taskDeadlineTime.getMinutes(), 0, 0);
            return date;
          })()
        : null;
      const ok = await createTask({
        habitId: taskHabitId,
        name: taskName,
        urgent: taskUrgent,
        pinned: taskPinned,
        deadline,
        notes: taskNotes,
      });
      if (!ok) return;

      finishCreate();
      return;
    }

    const schedule = buildSchedule();
    const habitId = await create({ name, icon, color, schedule });
    if (!habitId) return;

    const useCases = await getUseCases();
    await useCases.setHabitReminder({
      habitId,
      enabled: reminderEnabled,
      time: toClockTime(reminderTime),
      preEnabled: preReminderEnabled,
      followupEnabled: followupReminderEnabled,
    });

    finishCreate();
  };

  const label = mode === 'task' ? strings.form.taskNewTitle : strings.form.newTitle;
  const namePlaceholder = mode === 'task' ? strings.form.taskNamePlaceholder : strings.form.namePlaceholder;

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));
  const deadlineScrimStyle = useAnimatedStyle(() => ({ opacity: deadlineModal.progress.value }));
  const deadlineCardStyle = useAnimatedStyle(() => ({
    opacity: deadlineModal.progress.value,
    transform: [{ scale: interpolate(deadlineModal.progress.value, [0, 1], [0.92, 1]) }],
  }));

  return (
    <Modal visible={shouldRender} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[{ flex: 1, backgroundColor: theme.colors.surface.scrim }, scrimStyle]}>
        <Pressable
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          onPress={onClose}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            paddingBottom: theme.spacing.xxl * 2,
            paddingHorizontal: theme.spacing.md,
          }}
          pointerEvents="box-none"
        >
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface.primary,
                padding: theme.spacing.lg,
                gap: theme.spacing.lg,
                borderWidth: 1.5,
                borderColor: theme.colors.accent.glow,
                shadowColor: theme.colors.accent.default,
                shadowOpacity: theme.scheme === 'dark' ? 0.5 : 0.25,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 16,
              },
              cardStyle,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <PressableScale
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={strings.form.cancel}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.surface.secondary,
                }}
              >
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  {strings.form.cancel}
                </ThemedText>
              </PressableScale>

              <View
                style={{
                  flexDirection: 'row',
                  padding: 4,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.surface.secondary,
                }}
              >
                {(['habit', 'task'] as const).map((value) => {
                  const selected = mode === value;
                  const disabled = value === 'task' && habitsList.length === 0;
                  return (
                    <PressableScale
                      key={value}
                      onPress={() => {
                        if (disabled) return;
                        Haptics.selectionAsync();
                        setMode(value);
                      }}
                      disabled={disabled}
                      accessibilityRole="tab"
                      accessibilityState={{ selected, disabled }}
                      accessibilityLabel={value === 'habit' ? strings.form.modeHabit : strings.form.modeTask}
                      style={{
                        paddingVertical: theme.spacing.xs,
                        paddingHorizontal: theme.spacing.md,
                        borderRadius: theme.radius.full,
                        backgroundColor: selected ? theme.colors.surface.elevated : 'transparent',
                        opacity: disabled ? 0.4 : 1,
                      }}
                    >
                      <ThemedText variant="footnote" style={{ fontWeight: '600' }}>
                        {value === 'habit' ? strings.form.modeHabit : strings.form.modeTask}
                      </ThemedText>
                    </PressableScale>
                  );
                })}
              </View>

              <PressableScale
                onPress={onCreate}
                disabled={!canSave}
                accessibilityRole="button"
                accessibilityLabel={strings.form.create}
                style={{
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.full,
                  backgroundColor: canSave ? theme.colors.accent.default : theme.colors.surface.secondary,
                }}
              >
                <ThemedText
                  variant="footnote"
                  style={{
                    fontWeight: '600',
                    color: canSave ? theme.colors.text.onSolid : theme.colors.text.secondary,
                  }}
                >
                  {strings.form.create}
                </ThemedText>
              </PressableScale>
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <ThemedText variant="footnote" color="secondary" style={{ fontWeight: '600' }}>
                {label.toUpperCase()}
              </ThemedText>
              <TextInput
                value={mode === 'task' ? taskName : name}
                onChangeText={mode === 'task' ? setTaskName : setName}
                placeholder={namePlaceholder}
                placeholderTextColor={theme.colors.text.secondary}
                maxLength={mode === 'task' ? MAX_TASK_NAME_LENGTH : MAX_HABIT_NAME_LENGTH}
                accessibilityLabel={mode === 'task' ? strings.a11y.taskName : strings.a11y.habitName}
                returnKeyType="done"
                style={{ ...theme.typography.headline, color: theme.colors.text.primary, padding: 0 }}
              />
            </View>

            {mode === 'task' ? (
              <TextInput
                value={taskNotes}
                onChangeText={setTaskNotes}
                placeholder={strings.form.taskNotesPlaceholder}
                placeholderTextColor={theme.colors.text.secondary}
                maxLength={MAX_TASK_NOTES_LENGTH}
                accessibilityLabel={strings.a11y.taskNotes}
                style={{ ...theme.typography.footnote, color: theme.colors.text.secondary, padding: 0 }}
              />
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: theme.spacing.sm }}
            >
              {mode === 'task' ? (
                <>
                  <Chip
                    label={selectedTaskHabit?.habit.name ?? strings.form.taskListChip}
                    icon="list"
                    selected={taskHabitId !== null}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setListPickerVisible(true);
                    }}
                  />
                  <Chip
                    label={
                      taskDeadlineDate
                        ? formatDeadline(
                            (() => {
                              const date = fromISODate(taskDeadlineDate);
                              date.setHours(taskDeadlineTime.getHours(), taskDeadlineTime.getMinutes(), 0, 0);
                              return date;
                            })(),
                          )
                        : strings.form.taskDeadline
                    }
                    icon="calendar"
                    selected={taskDeadlineDate !== null}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTaskDeadlineVisible(true);
                    }}
                  />
                  <Chip
                    label={strings.form.taskCustomize}
                    icon="sliders"
                    selected={taskUrgent || taskPinned}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTaskCustomizeVisible(true);
                    }}
                  />
                </>
              ) : (
                <Chip
                  label={strings.form.taskCustomize}
                  icon="sliders"
                  onPress={() => {
                    Haptics.selectionAsync();
                    setHabitCustomizeVisible(true);
                  }}
                />
              )}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>

      <HabitCustomizeSheet
        visible={habitCustomizeVisible}
        icon={icon}
        onIconChange={setIcon}
        color={color}
        onColorChange={setColor}
        scheduleType={scheduleType}
        onScheduleTypeChange={onScheduleTypeChange}
        selectedDays={selectedDays}
        onSelectedDaysChange={setSelectedDays}
        timesPerWeek={timesPerWeek}
        onTimesPerWeekChange={setTimesPerWeek}
        reminderEnabled={reminderEnabled}
        onToggleReminder={onToggleReminder}
        reminderTime={reminderTime}
        onReminderTimeChange={setReminderTime}
        preReminderEnabled={preReminderEnabled}
        onPreReminderChange={setPreReminderEnabled}
        followupReminderEnabled={followupReminderEnabled}
        onFollowupReminderChange={setFollowupReminderEnabled}
        permission={permission}
        onClose={() => setHabitCustomizeVisible(false)}
      />

      <TaskCustomizeSheet
        visible={taskCustomizeVisible}
        urgent={taskUrgent}
        onUrgentChange={setTaskUrgent}
        pinned={taskPinned}
        onPinnedChange={setTaskPinned}
        onClose={() => setTaskCustomizeVisible(false)}
      />

      <ListPickerModal
        visible={listPickerVisible}
        habits={habitsList}
        selectedId={taskHabitId}
        onSelect={(id) => {
          Haptics.selectionAsync();
          setTaskHabitId(id);
          setListPickerVisible(false);
        }}
        onClose={() => setListPickerVisible(false)}
      />

      <Modal
        visible={deadlineModal.shouldRender}
        transparent
        animationType="none"
        onRequestClose={() => setTaskDeadlineVisible(false)}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: theme.colors.surface.scrim,
              alignItems: 'center',
              justifyContent: 'center',
              padding: theme.spacing.lg,
            },
            deadlineScrimStyle,
          ]}
        >
          <Pressable
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setTaskDeadlineVisible(false)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                width: '100%',
                maxWidth: 340,
                borderRadius: theme.radius.xl,
                backgroundColor: theme.colors.surface.secondary,
                padding: theme.spacing.md,
                gap: theme.spacing.md,
              },
              deadlineCardStyle,
            ]}
          >
            <DeadlineCalendar
              month={taskDeadlineMonth}
              onMonthChange={setTaskDeadlineMonth}
              selected={taskDeadlineDate}
              onSelectDay={(date) => {
                Haptics.selectionAsync();
                setTaskDeadlineDate(date);
              }}
            />

            {taskDeadlineDate ? (
              <>
                <PressableScale
                  onPress={() => setTaskDeadlineTimePickerVisible(true)}
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
                    backgroundColor: theme.colors.surface.elevated,
                  }}
                >
                  <Icon name="clock" size={16} color={theme.colors.text.secondary} />
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {strings.form.time}
                  </ThemedText>
                  <View
                    style={{
                      backgroundColor: theme.colors.surface.primary,
                      borderRadius: theme.radius.sm,
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: 4,
                    }}
                  >
                    <ThemedText variant="body" style={{ fontWeight: '500' }}>
                      {formatTime12h(taskDeadlineTime)}
                    </ThemedText>
                  </View>
                </PressableScale>

                <PressableScale
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTaskDeadlineDate(null);
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

            <PressableScale
              onPress={() => setTaskDeadlineVisible(false)}
              accessibilityRole="button"
              accessibilityLabel={strings.form.done}
              style={{
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.radius.lg,
                backgroundColor: theme.colors.accent.default,
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: '600', color: theme.colors.text.onSolid }}>
                {strings.form.done}
              </ThemedText>
            </PressableScale>
          </Animated.View>
        </Animated.View>
      </Modal>

      <TimePickerModal
        visible={taskDeadlineDate !== null && taskDeadlineTimePickerVisible}
        value={taskDeadlineTime}
        onCancel={() => setTaskDeadlineTimePickerVisible(false)}
        onConfirm={(date) => {
          setTaskDeadlineTime(date);
          setTaskDeadlineTimePickerVisible(false);
        }}
      />
    </Modal>
  );
}
