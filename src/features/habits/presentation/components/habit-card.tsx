import { View } from 'react-native';
import { router } from 'expo-router';

import { useAppTheme } from '@/core/theme';
import { ThemedText, IconWell, HeatMap, PressableScale } from '@/core/ui';
import { describeSchedule, describeStreak } from '@/features/habits/presentation/format';
import { addDays, today as todayDate } from '@/features/habits/domain/date';
import type { HabitSummary } from '@/features/habits/domain/use-cases/get-habits';

const HEATMAP_DAYS = 70;

function recentValues(history: string[], length: number): number[] {
  const completed = new Set(history);
  const end = todayDate();
  return Array.from({ length }, (_, index) =>
    completed.has(addDays(end, -(length - 1 - index))) ? 1 : 0,
  );
}

type HabitCardProps = {
  summary: HabitSummary;
  muted?: boolean;
};

export function HabitCard({ summary, muted = false }: HabitCardProps) {
  const theme = useAppTheme();
  const { habit, streaks, history } = summary;

  return (
    <PressableScale
      onPress={() => router.push(`/habit/${habit.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}, ${describeStreak(streaks)}`}
      activeScale={0.985}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface.secondary,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <IconWell name={habit.icon} color={habit.color} size={36} muted={muted} />

      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline">{habit.name}</ThemedText>
        <ThemedText variant="footnote" color="secondary">
          {describeStreak(streaks)} · {describeSchedule(habit.schedule)}
        </ThemedText>
      </View>

      <HeatMap
        values={recentValues(history, HEATMAP_DAYS)}
        color={habit.color}
        rows={5}
        cellSize={5}
        gap={2}
      />
    </PressableScale>
  );
}
