import { useCallback, useState } from 'react';
import { Modal, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  Card,
  IconWell,
  SegmentedControl,
  StatCard,
  Button,
  PressableScale,
  Icon,
  EmptyState,
  Enter,
  ProgressBar,
  CompletionCheck,
} from '@/core/ui';
import { getUseCases } from '@/core/di';
import { useHabitsStore } from '@/features/habits/presentation/store';
import { describeSchedule } from '@/features/habits/presentation/format';
import { YearHeatMap } from '@/features/habits/presentation/components/year-heat-map';
import { MonthCalendar } from '@/features/habits/presentation/components/month-calendar';
import { startOfMonth } from '@/features/habits/domain/calendar';
import { today as todayDate, type ISODate } from '@/features/habits/domain/date';
import type { HabitDetail } from '@/features/habits/domain/use-cases/get-habit-detail';
import type { HabitTasks } from '@/features/habits/domain/use-cases/get-habit-tasks';
import { MAX_TASK_NAME_LENGTH } from '@/features/habits/domain/entities/task';

const HISTORY_DAYS = 364;

type HistoryView = 'year' | 'month';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const [detail, setDetail] = useState<HabitDetail | null>(null);
  const [tasks, setTasks] = useState<HabitTasks | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<HistoryView>('year');
  const [month, setMonth] = useState<ISODate>(() => startOfMonth(todayDate()));
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const toggle = useHabitsStore((state) => state.toggle);

  const load = useCallback(async () => {
    const useCases = await getUseCases();
    const [habitDetail, habitTasks] = await Promise.all([
      useCases.getHabitDetail(id),
      useCases.getHabitTasks(id),
    ]);
    setDetail(habitDetail);
    setTasks(habitTasks);
    setLoaded(true);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const roundButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface.secondary,
  } as const;

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
      }}
    >
      <PressableScale
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={strings.a11y.back}
        style={roundButtonStyle}
      >
        <Icon name="back" size={20} color={theme.colors.accent.default} />
      </PressableScale>

      {detail ? (
        <PressableScale
          onPress={() => router.push({ pathname: '/habit-form', params: { id: detail.habit.id } })}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.editHabit}
          style={roundButtonStyle}
        >
          <Icon name="edit" size={20} color={theme.colors.accent.default} />
        </PressableScale>
      ) : null}
    </View>
  );

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.surface.primary }} />;
  }

  if (!detail) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.surface.primary }}
        edges={['top']}
      >
        {header}
        <EmptyState title={strings.detail.notFoundTitle} message={strings.detail.notFoundMessage} />
      </SafeAreaView>
    );
  }

  const { habit, streaks, completedToday, history, last30Percent } = detail;

  const onToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetail((current) =>
      current ? { ...current, completedToday: !current.completedToday } : current,
    );
    await toggle(habit.id);
    await load();
  };

  const onToggleTask = async (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks((current) => {
      if (!current) return current;
      const task = current.tasks.find((entry) => entry.id === taskId);
      if (!task) return current;

      const completedToday = !task.completedToday;
      return {
        ...current,
        tasks: current.tasks.map((entry) =>
          entry.id === taskId ? { ...entry, completedToday } : entry,
        ),
        completedCount: current.completedCount + (completedToday ? 1 : -1),
      };
    });

    const useCases = await getUseCases();
    await useCases.toggleTaskCompletion(taskId);
  };

  const onAddTask = async () => {
    const trimmed = newTaskName.trim();
    if (trimmed.length === 0) return;

    const useCases = await getUseCases();
    const result = await useCases.createTask({ habitId: habit.id, name: trimmed });
    if (!result.ok) return;

    setNewTaskName('');
    setAddingTask(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const habitTasks = await useCases.getHabitTasks(habit.id);
    setTasks(habitTasks);
  };

  const onToggleDay = async (date: ISODate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetail((current) =>
      current
        ? {
            ...current,
            history: current.history.includes(date)
              ? current.history.filter((entry) => entry !== date)
              : [...current.history, date],
          }
        : current,
    );
    await toggle(habit.id, date);
    await load();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.primary }} edges={['top']}>
      {header}

      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Enter index={0} lift={false} style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          <IconWell name={habit.icon} color={habit.color} size={72} />
          <ThemedText variant="largeTitle">{habit.name}</ThemedText>
          <ThemedText variant="subheadline" style={{ color: theme.colors.text.accent }}>
            {describeSchedule(habit.schedule)}
          </ThemedText>
        </Enter>

        <Enter index={1} style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <StatCard
            icon="streak"
            iconColor={theme.colors.habit.red.solid}
            value={String(streaks.current)}
            label={strings.detail.dayStreak}
          />
          <StatCard
            icon="trophy"
            iconColor={theme.colors.habit.yellow.solid}
            value={String(streaks.longest)}
            label={strings.detail.bestStreak}
          />
          <StatCard
            icon="chart"
            iconColor={theme.colors.accent.default}
            value={`${last30Percent}%`}
            label={strings.detail.last30}
          />
        </Enter>

        {tasks ? (
          <Enter index={2} style={{ gap: theme.spacing.sm }}>
            {tasks.totalCount > 0 ? (
              <>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <ThemedText variant="headline">{strings.tasks.title}</ThemedText>
                  <ThemedText variant="footnote" color="secondary">
                    {strings.tasks.progress(tasks.completedCount, tasks.totalCount)}
                  </ThemedText>
                </View>

                <ProgressBar value={tasks.completedCount / tasks.totalCount} />
              </>
            ) : null}

            <Card padded={false}>
              {tasks.tasks.map((task, index) => (
                <PressableScale
                  key={task.id}
                  onPress={() => onToggleTask(task.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.completedToday }}
                  accessibilityLabel={strings.a11y.toggleTask(task.name)}
                  activeScale={0.99}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    paddingHorizontal: theme.spacing.md,
                    minHeight: 52,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: theme.colors.border.default,
                  }}
                >
                  <CompletionCheck completed={task.completedToday} color={habit.color} size={22} />
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
                </PressableScale>
              ))}

              <PressableScale
                onPress={() => setAddingTask(true)}
                accessibilityRole="button"
                accessibilityLabel={strings.a11y.addTask}
                activeScale={0.99}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingHorizontal: theme.spacing.md,
                  minHeight: 52,
                  borderTopWidth: tasks.tasks.length === 0 ? 0 : 1,
                  borderTopColor: theme.colors.border.default,
                }}
              >
                <Icon name="add" size={16} color={theme.colors.accent.default} />
                <ThemedText variant="body" style={{ color: theme.colors.accent.default }}>
                  {strings.tasks.add}
                </ThemedText>
              </PressableScale>
            </Card>
          </Enter>
        ) : null}

        <Enter index={3} style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="headline">{strings.detail.history}</ThemedText>
            <ThemedText variant="footnote" color="secondary">
              {view === 'year' ? strings.detail.lastTwelveMonths : ''}
            </ThemedText>
          </View>

          <SegmentedControl
            options={[
              { value: 'year', label: strings.detail.viewYear },
              { value: 'month', label: strings.detail.viewMonth },
            ]}
            value={view}
            onChange={setView}
            accessibilityLabel={strings.detail.history}
          />

          <Card>
            {view === 'year' ? (
              <YearHeatMap
                history={history}
                end={todayDate()}
                days={HISTORY_DAYS}
                color={habit.color}
                accessibilityLabel={strings.detail.heatMapLabel(habit.name, history.length)}
              />
            ) : (
              <MonthCalendar
                month={month}
                onMonthChange={setMonth}
                history={history}
                color={habit.color}
                onToggleDay={onToggleDay}
              />
            )}
          </Card>
        </Enter>

        <Enter index={4}>
          <Button
            label={completedToday ? strings.detail.undo : strings.detail.markDone}
            icon={completedToday ? 'undo' : 'checkCircle'}
            variant={completedToday ? 'secondary' : 'primary'}
            tint={theme.colors.habit[habit.color].solid}
            onPress={onToggle}
          />
        </Enter>
      </ScrollView>

      <Modal
        visible={addingTask}
        transparent
        animationType="fade"
        onRequestClose={() => setAddingTask(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.surface.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 340,
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <ThemedText variant="title">{strings.tasks.newTitle}</ThemedText>
            <TextInput
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder={strings.tasks.namePlaceholder}
              placeholderTextColor={theme.colors.text.secondary}
              maxLength={MAX_TASK_NAME_LENGTH}
              accessibilityLabel={strings.a11y.taskName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onAddTask}
              style={{
                ...theme.typography.body,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surface.elevated,
                borderRadius: theme.radius.lg,
                paddingHorizontal: theme.spacing.md,
                minHeight: 52,
              }}
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button
                  label={strings.tasks.cancel}
                  variant="secondary"
                  onPress={() => {
                    setAddingTask(false);
                    setNewTaskName('');
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label={strings.tasks.create}
                  onPress={onAddTask}
                  disabled={newTaskName.trim().length === 0}
                  tint={theme.colors.habit[habit.color].solid}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
