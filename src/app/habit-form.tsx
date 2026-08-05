import { useCallback, useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, TextInput, Switch, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme, habitColorTokens, type HabitColorToken } from '@/core/theme';
import { duration } from '@/core/theme/motion';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  Button,
  PressableScale,
  Icon,
  IconWell,
  SegmentedControl,
  CompletionCheck,
  Enter,
  ConfirmDialog,
  type IconName,
} from '@/core/ui';
import { getUseCases } from '@/core/di';
import { ColorSwatch } from '@/features/habits/presentation/components/color-swatch';
import { useHabitsStore } from '@/features/habits/presentation/store';
import { describeSchedule } from '@/features/habits/presentation/format';
import {
  MAX_HABIT_NAME_LENGTH,
  weekdays,
  type Schedule,
  type Weekday,
} from '@/features/habits/domain/entities/habit';
import {
  DEFAULT_REMINDER_TIME,
  parseClockTime,
  toClockTime,
  type ClockTime,
} from '@/features/reminders/domain/entities/reminder';
import type { NotificationPermission } from '@/features/reminders/domain/notification-scheduler';

const habitIcons: IconName[] = [
  'running',
  'meditation',
  'book',
  'water',
  'walk',
  'dumbbell',
  'sleep',
  'heart',
  'pill',
  'sun',
];

const revealIn = FadeIn.duration(duration.fast);
const revealOut = FadeOut.duration(duration.instant);

function timeFromClock(time: ClockTime): Date {
  const { hour, minute } = parseClockTime(time);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export default function HabitFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const isEditing = Boolean(id);

  const create = useHabitsStore((state) => state.create);
  const edit = useHabitsStore((state) => state.edit);
  const remove = useHabitsStore((state) => state.remove);
  const archive = useHabitsStore((state) => state.archive);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>('running');
  const [color, setColor] = useState<HabitColorToken>('blue');
  const [scheduleType, setScheduleType] = useState<Schedule['type']>('daily');
  const [selectedDays, setSelectedDays] = useState<Weekday[]>(['mon', 'wed', 'fri']);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => timeFromClock(DEFAULT_REMINDER_TIME));
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const [archived, setArchived] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loaded, setLoaded] = useState(!id);
  const [nameFocused, setNameFocused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const useCases = await getUseCases();
      const current = await useCases.getNotificationPermission();
      if (!cancelled) setPermission(current);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      const useCases = await getUseCases();
      const [habit, reminder] = await Promise.all([
        useCases.getHabit(id),
        useCases.getHabitReminder(id),
      ]);
      if (cancelled || !habit) {
        setLoaded(true);
        return;
      }
      setName(habit.name);
      setIcon(habit.icon);
      setColor(habit.color);
      setArchived(habit.archived);
      setScheduleType(habit.schedule.type);
      if (habit.schedule.type === 'weekdays') setSelectedDays(habit.schedule.days);
      if (habit.schedule.type === 'timesPerWeek') setTimesPerWeek(habit.schedule.count);

      if (reminder) {
        setReminderEnabled(reminder.enabled);
        setReminderTime(timeFromClock(reminder.time));
      }

      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onToggleReminder = async (enabled: boolean) => {
    Haptics.selectionAsync();
    setReminderEnabled(enabled);
    if (!enabled) return;

    const useCases = await getUseCases();
    setPermission(await useCases.requestNotificationPermission());
  };

  const buildSchedule = useCallback((): Schedule => {
    switch (scheduleType) {
      case 'weekdays':
        return { type: 'weekdays', days: selectedDays };
      case 'timesPerWeek':
        return { type: 'timesPerWeek', count: timesPerWeek };
      default:
        return { type: 'daily' };
    }
  }, [scheduleType, selectedDays, timesPerWeek]);

  const schedule = buildSchedule();
  const canSave =
    name.trim().length > 0 && !(scheduleType === 'weekdays' && selectedDays.length === 0);

  const onSave = async () => {
    const habitId = isEditing
      ? (await edit(id!, { name, icon, color, schedule })) && id!
      : await create({ name, icon, color, schedule });

    if (!habitId) return;

    const useCases = await getUseCases();
    await useCases.setHabitReminder({
      habitId,
      enabled: reminderEnabled,
      time: toClockTime(reminderTime),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const onArchive = async () => {
    Haptics.selectionAsync();
    await archive(id!, !archived);
    router.back();
  };

  const onDelete = async () => {
    setConfirmingDelete(false);
    await remove(id!);
    router.dismissAll();
  };

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface.primary }} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.primary }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: 130,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Enter index={0} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText variant="largeTitle" style={{ flex: 1 }}>
            {isEditing ? strings.form.editTitle : strings.form.newTitle}
          </ThemedText>
          <PressableScale
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={strings.form.close}
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surface.elevated,
            }}
          >
            <Icon name="close" size={16} color={theme.colors.text.secondary} />
          </PressableScale>
        </Enter>

        <Enter index={1} lift={false}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.colors.surface.secondary,
            }}
          >
            <IconWell name={icon} color={color} size={44} />
            <View style={{ flex: 1, gap: 2 }}>
              <ThemedText variant="headline" numberOfLines={1}>
                {name.trim() || strings.form.previewName}
              </ThemedText>
              <ThemedText variant="footnote" style={{ color: theme.colors.text.accent }}>
                {describeSchedule(schedule)}
              </ThemedText>
            </View>
            <CompletionCheck completed={false} color={color} />
          </View>
        </Enter>

        <Enter index={2} style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="sectionHeader" color="secondary">
            {strings.form.name.toUpperCase()}
          </ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder={strings.form.namePlaceholder}
            placeholderTextColor={theme.colors.text.secondary}
            maxLength={MAX_HABIT_NAME_LENGTH}
            accessibilityLabel={strings.a11y.habitName}
            returnKeyType="done"
            style={{
              ...theme.typography.body,
              color: theme.colors.text.primary,
              backgroundColor: theme.colors.surface.secondary,
              borderRadius: theme.radius.lg,
              paddingHorizontal: theme.spacing.md,
              minHeight: 52,
              borderWidth: 2,
              borderColor: nameFocused ? theme.colors.accent.default : 'transparent',
              ...(nameFocused
                ? {
                    shadowColor: theme.colors.accent.default,
                    shadowOpacity: theme.scheme === 'dark' ? 0.35 : 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 4,
                  }
                : null),
            }}
          />
        </Enter>

        <Enter index={3} style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="sectionHeader" color="secondary">
            {strings.form.icon.toUpperCase()}
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
              paddingVertical: 3,
            }}
          >
            {habitIcons.map((candidate) => {
              const selected = candidate === icon;
              return (
                <PressableScale
                  key={candidate}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIcon(candidate);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={candidate}
                  style={{
                    borderRadius: theme.radius.full,
                    borderWidth: 2,
                    borderColor: selected ? theme.colors.habit[color].solid : 'transparent',
                    padding: 3,
                  }}
                >
                  <IconWell name={candidate} color={color} size={46} muted={!selected} />
                </PressableScale>
              );
            })}
          </View>
        </Enter>

        <Enter index={4} style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="sectionHeader" color="secondary">
            {strings.form.color.toUpperCase()}
          </ThemedText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {habitColorTokens.map((candidate) => {
              const selected = candidate === color;
              return (
                <PressableScale
                  key={candidate}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setColor(candidate);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={candidate}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: selected ? theme.colors.habit[candidate].solid : 'transparent',
                  }}
                >
                  <ColorSwatch color={candidate} selected={selected} />
                </PressableScale>
              );
            })}
          </View>
        </Enter>

        <Enter index={5} style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="sectionHeader" color="secondary">
            {strings.form.schedule.toUpperCase()}
          </ThemedText>
          <SegmentedControl
            accessibilityLabel={strings.a11y.scheduleType}
            value={scheduleType}
            onChange={(value) => {
              Haptics.selectionAsync();
              setScheduleType(value);
            }}
            options={[
              { value: 'daily', label: strings.form.daily },
              { value: 'weekdays', label: strings.form.specificDays },
              { value: 'timesPerWeek', label: strings.form.timesPerWeek },
            ]}
          />

          {scheduleType === 'weekdays' ? (
            <Animated.View
              entering={revealIn}
              exiting={revealOut}
              style={{ flexDirection: 'row', gap: theme.spacing.xs }}
            >
              {weekdays.map((day) => {
                const selected = selectedDays.includes(day);
                return (
                  <PressableScale
                    key={day}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDays((current) =>
                        current.includes(day)
                          ? current.filter((existing) => existing !== day)
                          : [...current, day],
                      );
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={strings.weekdayNames[day]}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      borderRadius: theme.radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected
                        ? theme.colors.habit[color].solid
                        : theme.colors.surface.secondary,
                    }}
                  >
                    <ThemedText
                      variant="footnote"
                      style={{
                        color: selected ? '#FFFFFF' : theme.colors.text.secondary,
                        fontWeight: '600',
                      }}
                    >
                      {strings.weekdayInitials[day]}
                    </ThemedText>
                  </PressableScale>
                );
              })}
            </Animated.View>
          ) : null}

          {scheduleType === 'timesPerWeek' ? (
            <Animated.View
              entering={revealIn}
              exiting={revealOut}
              style={{ flexDirection: 'row', gap: theme.spacing.xs }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((count) => {
                const selected = count === timesPerWeek;
                return (
                  <PressableScale
                    key={count}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTimesPerWeek(count);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={strings.a11y.timesPerWeek(count)}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      borderRadius: theme.radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected
                        ? theme.colors.habit[color].solid
                        : theme.colors.surface.secondary,
                    }}
                  >
                    <ThemedText
                      variant="footnote"
                      style={{
                        color: selected ? '#FFFFFF' : theme.colors.text.secondary,
                        fontWeight: '600',
                      }}
                    >
                      {count}
                    </ThemedText>
                  </PressableScale>
                );
              })}
            </Animated.View>
          ) : null}
        </Enter>

        <Enter index={6} style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="sectionHeader" color="secondary">
            {strings.form.reminder.toUpperCase()}
          </ThemedText>
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
              <Icon name="bell" size={18} color={theme.colors.text.secondary} />
              <ThemedText variant="body" style={{ flex: 1 }}>
                {strings.form.reminder}
              </ThemedText>
              <Switch
                value={reminderEnabled}
                onValueChange={onToggleReminder}
                accessibilityLabel={strings.a11y.enableReminder}
                trackColor={{ true: theme.colors.accent.default }}
              />
            </View>

            {reminderEnabled ? (
              <Animated.View entering={revealIn} exiting={revealOut}>
                <PressableScale
                  onPress={() => setPickerVisible((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={strings.form.time}
                  activeScale={0.99}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 52,
                    backgroundColor: theme.colors.surface.elevated,
                  }}
                >
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {strings.form.time}
                  </ThemedText>
                  <ThemedText variant="body" style={{ color: theme.colors.accent.default }}>
                    {toClockTime(reminderTime)}
                  </ThemedText>
                </PressableScale>
              </Animated.View>
            ) : null}
          </View>

          {reminderEnabled && pickerVisible ? (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event, date) => {
                if (Platform.OS !== 'ios') setPickerVisible(false);
                if (date) setReminderTime(date);
              }}
            />
          ) : null}

          {reminderEnabled && permission === 'denied' ? (
            <Animated.View entering={revealIn} exiting={revealOut}>
              <PressableScale
                onPress={() => Linking.openSettings()}
                accessibilityRole="button"
                accessibilityLabel={strings.reminders.openSettings}
                activeScale={0.99}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.state.dangerSubtle,
                }}
              >
                <Icon name="bell" size={16} color={theme.colors.state.danger} />
                <ThemedText
                  variant="footnote"
                  style={{ flex: 1, color: theme.colors.state.danger }}
                >
                  {strings.reminders.permissionDenied}
                </ThemedText>
                <Icon name="chevron" size={14} color={theme.colors.state.danger} />
              </PressableScale>
            </Animated.View>
          ) : null}

          {reminderEnabled ? (
            <Animated.View entering={revealIn} exiting={revealOut}>
              <ThemedText variant="footnote" color="secondary">
                {strings.form.reminderNote}
              </ThemedText>
            </Animated.View>
          ) : null}
        </Enter>

        {isEditing ? (
          <Enter index={7} style={{ gap: theme.spacing.sm }}>
            <Button
              label={archived ? strings.form.unarchive : strings.form.archive}
              variant="secondary"
              icon={archived ? 'restore' : 'export'}
              onPress={onArchive}
            />
            <ThemedText variant="footnote" color="secondary">
              {strings.form.archiveNote}
            </ThemedText>
            <Button
              label={strings.form.delete}
              variant="destructive"
              icon="trash"
              onPress={() => setConfirmingDelete(true)}
            />
          </Enter>
        ) : null}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          paddingBottom: insets.bottom + theme.spacing.sm,
          backgroundColor: theme.colors.surface.primary,
          shadowColor: '#000',
          shadowOpacity: theme.scheme === 'dark' ? 0.4 : 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 8,
        }}
      >
        <Button
          label={strings.form.save}
          icon="check"
          onPress={onSave}
          disabled={!canSave}
          tint={theme.colors.habit[color].solid}
          accessibilityLabel={strings.a11y.saveHabit}
        />
      </View>

      <ConfirmDialog
        visible={confirmingDelete}
        title={strings.form.deleteTitle}
        message={strings.form.deleteMessage}
        confirmLabel={strings.form.deleteConfirm}
        cancelLabel={strings.form.cancel}
        icon="trash"
        iconColor="red"
        destructive
        onConfirm={onDelete}
        onDismiss={() => setConfirmingDelete(false)}
      />
    </SafeAreaView>
  );
}
