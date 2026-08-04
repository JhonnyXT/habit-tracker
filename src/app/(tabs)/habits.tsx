import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { ThemedText, PressableScale, Icon, EmptyState, Enter, SectionHeader } from '@/core/ui';
import { HabitCard } from '@/features/habits/presentation/components/habit-card';
import { useHabitsStore } from '@/features/habits/presentation/store';

export default function HabitsScreen() {
  const theme = useAppTheme();
  const habits = useHabitsStore((state) => state.habits);
  const archived = useHabitsStore((state) => state.archived);
  const loadHabits = useHabitsStore((state) => state.loadHabits);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [loadHabits]),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.surface.primary }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl * 2.5,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Enter index={0} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText variant="largeTitle" style={{ flex: 1 }}>
            {strings.habits.title}
          </ThemedText>
          <PressableScale
            onPress={() => router.push('/habit-form')}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.addHabit}
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.surface.secondary,
            }}
          >
            <Icon name="add" size={20} color={theme.colors.accent.default} />
          </PressableScale>
        </Enter>

        {habits.length === 0 && archived.length === 0 ? (
          <EmptyState title={strings.habits.emptyTitle} message={strings.habits.emptyMessage} />
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            {habits.map((summary, index) => (
              <Enter key={summary.habit.id} index={index + 1}>
                <HabitCard summary={summary} />
              </Enter>
            ))}
          </View>
        )}

        {archived.length > 0 ? (
          <Enter index={habits.length + 1} style={{ gap: theme.spacing.sm }}>
            <SectionHeader>{strings.habits.archivedSection}</SectionHeader>
            {archived.map((summary) => (
              <HabitCard key={summary.habit.id} summary={summary} muted />
            ))}
          </Enter>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
