import { useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
import { getUseCases } from "@/core/di";
import { DailyGoal } from "@/features/habits/presentation/components/daily-goal";
import {
  DayCompleteOverlay,
  useDayComplete,
} from "@/features/habits/presentation/components/day-complete";
import { HabitRow } from "@/features/habits/presentation/components/habit-row";
import { EmptyTodayPreview } from "@/features/habits/presentation/components/empty-today-preview";
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

type Notice = { visible: false } | { visible: true; title: string; message: string };

export default function TodayScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const today = useHabitsStore((state) => state.today);
  const habits = useHabitsStore((state) => state.habits);
  const isLoading = useHabitsStore((state) => state.isLoading);
  const loadToday = useHabitsStore((state) => state.loadToday);
  const loadHabits = useHabitsStore((state) => state.loadHabits);
  const toggle = useHabitsStore((state) => state.toggle);
  const reorder = useHabitsStore((state) => state.reorder);
  const remove = useHabitsStore((state) => state.remove);
  const [pendingDelete, setPendingDelete] = useState<TodayHabit | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>({ visible: false });
  const reducedMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      loadToday();
      loadHabits();

      if (useOnboardingStore.getState().takeFirstHabitIntent())
        router.push("/habit-form");
    }, [loadToday, loadHabits]),
  );

  const doneCount = today.filter((entry) => entry.completedToday).length;
  const celebrating = useDayComplete(doneCount, today.length);

  const filteredToday = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return today;
    return today.filter((entry) => entry.habit.name.toLowerCase().includes(query));
  }, [today, searchQuery]);

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

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const onViewArchived = () => {
    setMenuOpen(false);
    router.push("/habits");
  };

  const onExportBackup = async () => {
    setMenuOpen(false);
    const useCases = await getUseCases();
    const result = await useCases.exportData();
    if (result.status === "empty") {
      setNotice({
        visible: true,
        title: strings.today.exportEmptyTitle,
        message: strings.today.exportEmptyMessage,
      });
    }
  };

  const hasAnyHabits = habits.length > 0;
  const isSearching = searchOpen && searchQuery.trim().length > 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.surface.primary }}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
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

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.surface.secondary,
              padding: 4,
              gap: 2,
            }}
          >
            <PressableScale
              onPress={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              disabled={today.length === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: today.length === 0 }}
              accessibilityLabel={strings.a11y.searchHabits}
              style={{
                width: 32,
                height: 32,
                borderRadius: theme.radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: searchOpen ? theme.colors.accent.subtle : "transparent",
                opacity: today.length === 0 ? 0.35 : 1,
              }}
            >
              <Icon
                name="search"
                size={16}
                color={searchOpen ? theme.colors.accent.default : theme.colors.text.secondary}
              />
            </PressableScale>
            <PressableScale
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={strings.a11y.moreOptions}
              style={{
                width: 32,
                height: 32,
                borderRadius: theme.radius.full,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="more" size={16} color={theme.colors.text.secondary} />
            </PressableScale>
          </View>
        </Enter>

        {searchOpen ? (
          <Enter index={1} lift={false}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={strings.today.searchPlaceholder}
              placeholderTextColor={theme.colors.text.secondary}
              autoFocus
              returnKeyType="search"
              accessibilityLabel={strings.a11y.searchHabits}
              style={{
                ...theme.typography.body,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.surface.secondary,
                borderRadius: theme.radius.lg,
                paddingHorizontal: theme.spacing.md,
                minHeight: 44,
              }}
            />
          </Enter>
        ) : null}

        {isLoading ? null : isSearching && filteredToday.length === 0 ? (
          <EmptyState
            title={strings.today.noResultsTitle}
            message={strings.today.noResultsMessage(searchQuery.trim())}
          />
        ) : today.length === 0 ? (
          hasAnyHabits ? (
            <EmptyState
              title={strings.today.nothingDueTitle}
              message={strings.today.nothingDueMessage}
            />
          ) : (
            <EmptyState
              title={strings.today.emptyTitle}
              message={strings.today.emptyMessage}
              illustration={<EmptyTodayPreview />}
            />
          )
        ) : (
          <>
            <Enter index={2}>
              <DailyGoal done={doneCount} total={today.length} />
            </Enter>

            <View>
              <Animated.View style={listStyle}>
                <Enter
                  index={3}
                  style={{
                    backgroundColor: theme.colors.surface.secondary,
                    borderRadius: theme.radius.lg,
                    overflow: "hidden",
                  }}
                >
                  <DraggableHabitList
                    items={filteredToday}
                    keyExtractor={(entry) => entry.habit.id}
                    isChecked={(entry) => entry.completedToday}
                    accessibilityLabelFor={(entry) =>
                      `${entry.habit.name}, ${subtitleFor(entry)}${
                        entry.taskProgress && entry.taskProgress.totalCount > 0
                          ? strings.a11y.taskProgress(
                              entry.taskProgress.completedCount,
                              entry.taskProgress.totalCount,
                            )
                          : ""
                      }`
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
                        taskProgress={entry.taskProgress}
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

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          right: theme.spacing.md,
          bottom: insets.bottom + theme.spacing.sm,
          width: 64,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PressableScale
          onPress={() => router.push("/habit-form")}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.addHabit}
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.radius.full,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface.secondary,
            shadowColor: theme.scheme === "dark" ? "#000" : theme.colors.text.primary,
            shadowOpacity: theme.scheme === "dark" ? 0.25 : 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Icon name="add" size={24} color={theme.colors.accent.default} />
        </PressableScale>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <PressableScale
          onPress={() => setMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: theme.colors.surface.scrim,
            justifyContent: "flex-end",
            padding: theme.spacing.md,
          }}
        >
          <View
            style={{
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              overflow: "hidden",
              marginBottom: insets.bottom,
            }}
          >
            <PressableScale
              onPress={onViewArchived}
              accessibilityRole="button"
              accessibilityLabel={strings.today.menuViewArchived}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.md,
                minHeight: 52,
              }}
            >
              <Icon name="archive" size={18} color={theme.colors.text.primary} />
              <ThemedText variant="body">{strings.today.menuViewArchived}</ThemedText>
            </PressableScale>
            <View style={{ height: 1, backgroundColor: theme.colors.border.default }} />
            <PressableScale
              onPress={onExportBackup}
              accessibilityRole="button"
              accessibilityLabel={strings.today.menuExportBackup}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.md,
                paddingHorizontal: theme.spacing.md,
                minHeight: 52,
              }}
            >
              <Icon name="export" size={18} color={theme.colors.text.primary} />
              <ThemedText variant="body">{strings.today.menuExportBackup}</ThemedText>
            </PressableScale>
          </View>

          <PressableScale
            onPress={() => setMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel={strings.today.menuCancel}
            style={{
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 52,
              marginBottom: insets.bottom,
            }}
          >
            <ThemedText variant="body" style={{ fontWeight: "600" }}>
              {strings.today.menuCancel}
            </ThemedText>
          </PressableScale>
        </PressableScale>
      </Modal>

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

      <ConfirmDialog
        visible={notice.visible}
        title={notice.visible ? notice.title : ""}
        message={notice.visible ? notice.message : ""}
        confirmLabel={strings.today.close}
        onConfirm={() => setNotice({ visible: false })}
        onDismiss={() => setNotice({ visible: false })}
      />
    </SafeAreaView>
  );
}
