import { useCallback, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import {
  ThemedText,
  Card,
  IconWell,
  HeatMap,
  StatCard,
  Button,
  PressableScale,
  Icon,
  EmptyState,
  Enter,
} from '@/core/ui';
import { getUseCases } from '@/core/di';
import { useHabitsStore } from '@/features/habits/presentation/store';
import { describeSchedule } from '@/features/habits/presentation/format';
import { addDays, today as todayDate } from '@/features/habits/domain/date';
import type { HabitDetail } from '@/features/habits/domain/use-cases/get-habit-detail';

const HISTORY_DAYS = 364;

function historyValues(history: string[]): number[] {
  const completed = new Set(history);
  const end = todayDate();
  return Array.from({ length: HISTORY_DAYS }, (_, index) =>
    completed.has(addDays(end, -(HISTORY_DAYS - 1 - index))) ? 1 : 0,
  );
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const [detail, setDetail] = useState<HabitDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const historyScroll = useRef<ScrollView>(null);
  const toggle = useHabitsStore((state) => state.toggle);

  const load = useCallback(async () => {
    const useCases = await getUseCases();
    setDetail(await useCases.getHabitDetail(id));
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

        <Enter index={2} style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemedText variant="headline">{strings.detail.history}</ThemedText>
            <ThemedText variant="footnote" color="secondary">
              {strings.detail.lastTwelveMonths}
            </ThemedText>
          </View>
          <Card>
            <ScrollView
              ref={historyScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              onContentSizeChange={() => historyScroll.current?.scrollToEnd({ animated: false })}
            >
              <HeatMap
                values={historyValues(history)}
                color={habit.color}
                rows={7}
                cellSize={10}
                gap={3}
              />
            </ScrollView>
          </Card>
        </Enter>

        <Enter index={3}>
          <Button
            label={completedToday ? strings.detail.undo : strings.detail.markDone}
            icon={completedToday ? 'undo' : 'checkCircle'}
            variant={completedToday ? 'secondary' : 'primary'}
            tint={theme.colors.habit[habit.color].solid}
            onPress={onToggle}
          />
        </Enter>
      </ScrollView>
    </SafeAreaView>
  );
}
