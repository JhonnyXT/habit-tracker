import { View } from 'react-native';
import { router } from 'expo-router';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, IconWell, HeatMap, PressableScale } from '@/core/ui';
import { describeSchedule, describeStreak } from '@/features/habits/presentation/format';
import { addDays, today as todayDate } from '@/features/habits/domain/date';
import type { HabitSummary } from '@/features/habits/domain/use-cases/get-habits';

const HEATMAP_DAYS = 70;

export const HABIT_CARD_HEIGHT = 76;

function recentValues(history: string[], length: number): number[] {
  const completed = new Set(history);
  const end = todayDate();
  return Array.from({ length }, (_, index) =>
    completed.has(addDays(end, -(length - 1 - index))) ? 1 : 0,
  );
}

type HabitCardProps = {
  interactive?: boolean;
  summary: HabitSummary;
  muted?: boolean;
};

export function HabitCard({ summary, muted = false, interactive = true }: HabitCardProps) {
  const theme = useAppTheme();
  const { habit, streaks, history } = summary;
  const recent = recentValues(history, HEATMAP_DAYS);

  const Container = interactive ? PressableScale : View;

  return (
    <Container
      {...(interactive
        ? {
            onPress: () => router.push(`/habit/${habit.id}`),
            accessibilityRole: 'button' as const,
            accessibilityLabel: `${habit.name}, ${describeStreak(streaks)}`,
            activeScale: 0.985,
          }
        : {})}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        height: HABIT_CARD_HEIGHT,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface.secondary,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <IconWell name={habit.icon} color={habit.color} size={36} muted={muted} />

      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText variant="headline" numberOfLines={1}>
          {habit.name}
        </ThemedText>
        <ThemedText variant="footnote" color="secondary" numberOfLines={1}>
          {describeStreak(streaks)} · {describeSchedule(habit.schedule)}
        </ThemedText>
      </View>

      <HeatMap
        values={recent}
        color={habit.color}
        accessibilityLabel={strings.habits.recentLabel(
          habit.name,
          recent.filter(Boolean).length,
          HEATMAP_DAYS,
        )}
        rows={5}
        cellSize={5}
        gap={2}
      />
    </Container>
  );
}
