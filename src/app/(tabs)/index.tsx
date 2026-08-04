import { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { useAppTheme } from "@/core/theme";
import { strings } from "@/core/i18n";
import {
  ThemedText,
  PressableScale,
  Icon,
  EmptyState,
  Enter,
  ConfirmDialog,
} from "@/core/ui";
import { DailyGoal } from "@/features/habits/presentation/components/daily-goal";
import {
  DayCompleteOverlay,
  useDayComplete,
} from "@/features/habits/presentation/components/day-complete";
import { HabitRow } from "@/features/habits/presentation/components/habit-row";
import { DraggableHabitList } from "@/features/habits/presentation/components/draggable-habit-list";
import { useHabitsStore } from "@/features/habits/presentation/store";
import { useOnboardingStore } from "@/features/onboarding/presentation/store";
import {
  describeSchedule,
  describeStreak,
  formatToday,
} from "@/features/habits/presentation/format";
import type { TodayHabit } from "@/features/habits/domain/use-cases/get-today-habits";

function subtitleFor(entry: TodayHabit): string {
  return entry.streaks.current > 0
    ? describeStreak(entry.streaks)
    : describeSchedule(entry.habit.schedule);
}

export default function TodayScreen() {
  const theme = useAppTheme();
  const today = useHabitsStore((state) => state.today);
  const isLoading = useHabitsStore((state) => state.isLoading);
  const loadToday = useHabitsStore((state) => state.loadToday);
  const toggle = useHabitsStore((state) => state.toggle);
  const reorder = useHabitsStore((state) => state.reorder);
  const remove = useHabitsStore((state) => state.remove);
  const [pendingDelete, setPendingDelete] = useState<TodayHabit | null>(null);
  const reducedMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      loadToday();

      if (useOnboardingStore.getState().takeFirstHabitIntent())
        router.push("/habit-form");
    }, [loadToday]),
  );

  const doneCount = today.filter((entry) => entry.completedToday).length;
  const celebrating = useDayComplete(doneCount, today.length);

  const listStyle = useAnimatedStyle(() => ({
    opacity: withTiming(celebrating && !reducedMotion ? 0.25 : 1, {
      duration: theme.motion.duration.default,
    }),
  }));

  const onToggle = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggle(id);
    },
    [toggle],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.surface.primary }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl * 2.5,
          gap: theme.spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Enter
          index={0}
          style={{ flexDirection: "row", alignItems: "flex-start" }}
        >
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <ThemedText variant="largeTitle">{strings.today.title}</ThemedText>
            <ThemedText
              variant="subheadline"
              style={{ color: theme.colors.text.accent }}
            >
              {formatToday(new Date())}
            </ThemedText>
          </View>

          <PressableScale
            onPress={() => router.push("/habit-form")}
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.addHabit}
            style={{
              width: 40,
              height: 40,
              borderRadius: theme.radius.full,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.surface.secondary,
            }}
          >
            <Icon name="add" size={20} color={theme.colors.accent.default} />
          </PressableScale>
        </Enter>

        {isLoading ? null : today.length === 0 ? (
          <EmptyState
            title={strings.today.emptyTitle}
            message={strings.today.emptyMessage}
          />
        ) : (
          <>
            <Enter index={1}>
              <DailyGoal done={doneCount} total={today.length} />
            </Enter>

            <View>
              <Animated.View style={listStyle}>
                <Enter
                  index={2}
                  style={{
                    backgroundColor: theme.colors.surface.secondary,
                    borderRadius: theme.radius.lg,
                    overflow: "hidden",
                  }}
                >
                  <DraggableHabitList
                    items={today}
                    keyExtractor={(entry) => entry.habit.id}
                    isChecked={(entry) => entry.completedToday}
                    accessibilityLabelFor={(entry) =>
                      `${entry.habit.name}, ${subtitleFor(entry)}`
                    }
                    onToggle={onToggle}
                    onReorder={reorder}
                    onEdit={(id) => router.push(`/habit-form?id=${id}`)}
                    onDelete={(id) =>
                      setPendingDelete(
                        today.find((entry) => entry.habit.id === id) ?? null,
                      )
                    }
                    renderItem={(entry) => (
                      <HabitRow
                        habit={entry.habit}
                        subtitle={subtitleFor(entry)}
                        completed={entry.completedToday}
                      />
                    )}
                  />
                </Enter>
              </Animated.View>

              <DayCompleteOverlay visible={celebrating} />
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title={strings.today.deleteTitle(pendingDelete?.habit.name ?? "")}
        message={strings.today.deleteMessage}
        confirmLabel={strings.today.deleteConfirm}
        cancelLabel={strings.today.cancel}
        icon="trash"
        iconColor="red"
        destructive
        onConfirm={async () => {
          const target = pendingDelete;
          setPendingDelete(null);
          if (!target) return;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await remove(target.habit.id);
        }}
        onDismiss={() => setPendingDelete(null)}
      />
    </SafeAreaView>
  );
}
