import { useState } from 'react';
import { Linking, Modal, Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useAppTheme, habitColorTokens, type HabitColorToken } from '@/core/theme';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  Icon,
  PressableScale,
  SegmentedControl,
  TimePickerModal,
  useModalProgress,
  type IconName,
} from '@/core/ui';
import { ColorSwatch } from '@/features/habits/presentation/components/color-swatch';
import { CustomizeSection } from '@/features/habits/presentation/components/customize-section';
import { weekdays, type Schedule, type Weekday } from '@/features/habits/domain/entities/habit';
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

const time12hFormatter = new Intl.DateTimeFormat('es', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function formatTime12h(date: Date): string {
  return time12hFormatter.format(date);
}

type HabitCustomizeSheetProps = {
  visible: boolean;
  icon: IconName;
  onIconChange: (icon: IconName) => void;
  color: HabitColorToken;
  onColorChange: (color: HabitColorToken) => void;
  scheduleType: Schedule['type'];
  onScheduleTypeChange: (type: Schedule['type']) => void;
  selectedDays: Weekday[];
  onSelectedDaysChange: (days: Weekday[]) => void;
  timesPerWeek: number;
  onTimesPerWeekChange: (count: number) => void;
  reminderEnabled: boolean;
  onToggleReminder: (enabled: boolean) => void;
  reminderTime: Date;
  onReminderTimeChange: (time: Date) => void;
  preReminderEnabled: boolean;
  onPreReminderChange: (value: boolean) => void;
  followupReminderEnabled: boolean;
  onFollowupReminderChange: (value: boolean) => void;
  permission: NotificationPermission;
  onClose: () => void;
};

export function HabitCustomizeSheet({
  visible,
  icon,
  onIconChange,
  color,
  onColorChange,
  scheduleType,
  onScheduleTypeChange,
  selectedDays,
  onSelectedDaysChange,
  timesPerWeek,
  onTimesPerWeekChange,
  reminderEnabled,
  onToggleReminder,
  reminderTime,
  onReminderTimeChange,
  preReminderEnabled,
  onPreReminderChange,
  followupReminderEnabled,
  onFollowupReminderChange,
  permission,
  onClose,
}: HabitCustomizeSheetProps) {
  const theme = useAppTheme();
  const [pickerVisible, setPickerVisible] = useState(false);
  const { shouldRender, progress } = useModalProgress(visible);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  const toggleDay = (day: Weekday) => {
    Haptics.selectionAsync();
    onSelectedDaysChange(
      selectedDays.includes(day) ? selectedDays.filter((existing) => existing !== day) : [...selectedDays, day],
    );
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

            <ThemedText variant="headline">{strings.form.taskCustomize}</ThemedText>

            <PressableScale
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={strings.form.done}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.surface.secondary,
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                {strings.form.done}
              </ThemedText>
            </PressableScale>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.md }}
            showsVerticalScrollIndicator={false}
          >
          <CustomizeSection icon={icon} label={strings.form.icon}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {habitIcons.map((candidate) => {
                const selected = candidate === icon;
                return (
                  <PressableScale
                    key={candidate}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onIconChange(candidate);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={candidate}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: theme.radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? theme.colors.habit[color].tint : theme.colors.surface.elevated,
                    }}
                  >
                    <Icon
                      name={candidate}
                      size={20}
                      color={selected ? theme.colors.habit[color].solid : theme.colors.text.secondary}
                    />
                  </PressableScale>
                );
              })}
            </View>
          </CustomizeSection>

          <CustomizeSection icon="palette" label={strings.form.color}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
              {habitColorTokens.map((candidate) => {
                const selected = candidate === color;
                return (
                  <PressableScale
                    key={candidate}
                    onPress={() => {
                      Haptics.selectionAsync();
                      onColorChange(candidate);
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
          </CustomizeSection>

          <CustomizeSection icon="calendar" label={strings.form.schedule}>
            <View style={{ gap: theme.spacing.sm }}>
              <SegmentedControl
                accessibilityLabel={strings.a11y.scheduleType}
                value={scheduleType}
                onChange={(value) => {
                  Haptics.selectionAsync();
                  onScheduleTypeChange(value);
                }}
                options={[
                  { value: 'daily', label: strings.form.daily },
                  { value: 'weekdays', label: strings.form.specificDays },
                  { value: 'timesPerWeek', label: strings.form.timesPerWeek },
                ]}
              />

              {scheduleType === 'weekdays' ? (
                <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                  {weekdays.map((day) => {
                    const selected = selectedDays.includes(day);
                    return (
                      <PressableScale
                        key={day}
                        onPress={() => toggleDay(day)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={strings.weekdayNames[day]}
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: theme.radius.full,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: selected ? theme.colors.habit[color].solid : theme.colors.surface.elevated,
                        }}
                      >
                        <ThemedText
                          variant="footnote"
                          style={{ color: selected ? '#FFFFFF' : theme.colors.text.secondary, fontWeight: '600' }}
                        >
                          {strings.weekdayInitials[day]}
                        </ThemedText>
                      </PressableScale>
                    );
                  })}
                </View>
              ) : null}

              {scheduleType === 'timesPerWeek' ? (
                <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
                  {[1, 2, 3, 4, 5, 6, 7].map((count) => {
                    const selected = count === timesPerWeek;
                    return (
                      <PressableScale
                        key={count}
                        onPress={() => {
                          Haptics.selectionAsync();
                          onTimesPerWeekChange(count);
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
                          backgroundColor: selected ? theme.colors.habit[color].solid : theme.colors.surface.elevated,
                        }}
                      >
                        <ThemedText
                          variant="footnote"
                          style={{ color: selected ? '#FFFFFF' : theme.colors.text.secondary, fontWeight: '600' }}
                        >
                          {count}
                        </ThemedText>
                      </PressableScale>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </CustomizeSection>

          <CustomizeSection icon="bell" label={strings.form.reminder}>
            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText variant="body" style={{ flex: 1, fontWeight: '600' }}>
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
                <PressableScale
                  onPress={() => setPickerVisible(true)}
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
                      {formatTime12h(reminderTime)}
                    </ThemedText>
                  </View>
                </PressableScale>
              ) : null}

              {reminderEnabled && scheduleType === 'daily' ? (
                <View
                  style={{
                    borderRadius: theme.radius.lg,
                    backgroundColor: theme.colors.surface.elevated,
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
                    <ThemedText variant="footnote" style={{ flex: 1 }}>
                      {strings.form.preReminder}
                    </ThemedText>
                    <Switch
                      value={preReminderEnabled}
                      onValueChange={(value) => {
                        Haptics.selectionAsync();
                        onPreReminderChange(value);
                      }}
                      accessibilityLabel={strings.a11y.enablePreReminder}
                      trackColor={{ true: theme.colors.accent.default }}
                    />
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
                    <ThemedText variant="footnote" style={{ flex: 1 }}>
                      {strings.form.followupReminder}
                    </ThemedText>
                    <Switch
                      value={followupReminderEnabled}
                      onValueChange={(value) => {
                        Haptics.selectionAsync();
                        onFollowupReminderChange(value);
                      }}
                      accessibilityLabel={strings.a11y.enableFollowupReminder}
                      trackColor={{ true: theme.colors.accent.default }}
                    />
                  </View>
                </View>
              ) : null}

              {reminderEnabled && scheduleType !== 'daily' ? (
                <ThemedText variant="footnote" color="secondary">
                  {strings.form.multiAlertDailyOnly}
                </ThemedText>
              ) : null}

              {reminderEnabled && permission === 'denied' ? (
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
                  <ThemedText variant="footnote" style={{ flex: 1, color: theme.colors.state.danger }}>
                    {strings.reminders.permissionDenied}
                  </ThemedText>
                  <Icon name="chevron" size={14} color={theme.colors.state.danger} />
                </PressableScale>
              ) : null}

              {reminderEnabled ? (
                <ThemedText variant="footnote" color="secondary">
                  {strings.form.reminderNote}
                </ThemedText>
              ) : null}
            </View>
          </CustomizeSection>
          </ScrollView>
        </Animated.View>
      </Animated.View>

      <TimePickerModal
        visible={pickerVisible}
        value={reminderTime}
        onCancel={() => setPickerVisible(false)}
        onConfirm={(date) => {
          onReminderTimeChange(date);
          setPickerVisible(false);
        }}
      />
    </Modal>
  );
}
