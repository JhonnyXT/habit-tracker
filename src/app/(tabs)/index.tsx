import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
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
  SearchField,
  useModalProgress,
  useSuccessOverlayStore,
} from "@/core/ui";
import { getUseCases } from "@/core/di";
import { DailyGoal } from "@/features/habits/presentation/components/daily-goal";
import {
  DayCompleteOverlay,
  useDayComplete,
} from "@/features/habits/presentation/components/day-complete";
import { HabitRow, HABIT_ROW_HEIGHT } from "@/features/habits/presentation/components/habit-row";
import { EmptyTodayPreview } from "@/features/habits/presentation/components/empty-today-preview";
import { DraggableHabitList } from "@/features/habits/presentation/components/draggable-habit-list";
import { TaskCard } from "@/features/habits/presentation/components/task-card";
import { TaskDetailSheet } from "@/features/habits/presentation/components/task-detail-sheet";
import { TaskEditSheet } from "@/features/habits/presentation/components/task-edit-sheet";
import { useHabitsStore } from "@/features/habits/presentation/store";
import { useCreateSheetStore } from "@/features/habits/presentation/create-sheet-store";
import { useOnboardingStore } from "@/features/onboarding/presentation/store";
import { describeSchedule, formatToday } from "@/features/habits/presentation/format";
import type { TodayHabit } from "@/features/habits/domain/use-cases/get-today-habits";
import type { TaskWithState } from "@/features/habits/domain/use-cases/get-habit-tasks";
import type { IconName } from "@/core/ui/icons";

function subtitleFor(entry: TodayHabit): string {
  return describeSchedule(entry.habit.schedule);
}

const subtitleIcon: IconName = "repeat";

type Notice = { visible: false } | { visible: true; title: string; message: string };
type ListFilter = "all" | "withTasks" | "completed";
const CARD_GAP = 8;

export default function TodayScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const today = useHabitsStore((state) => state.today);
  const habits = useHabitsStore((state) => state.habits);
  const isLoading = useHabitsStore((state) => state.isLoading);
  const loadToday = useHabitsStore((state) => state.loadToday);
  const loadHabits = useHabitsStore((state) => state.loadHabits);
  const toggle = useHabitsStore((state) => state.toggle);
  const toggleTask = useHabitsStore((state) => state.toggleTask);
  const deleteTask = useHabitsStore((state) => state.deleteTask);
  const reorder = useHabitsStore((state) => state.reorder);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<TaskWithState | null>(null);
  const [removingTaskId, setRemovingTaskId] = useState<string | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskWithState | null>(null);
  const [editingTask, setEditingTask] = useState<TaskWithState | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [listsMenuOpen, setListsMenuOpen] = useState(false);
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [notice, setNotice] = useState<Notice>({ visible: false });
  const reducedMotion = useReducedMotion();

  const menuModal = useModalProgress(menuOpen);
  const listsModal = useModalProgress(listsMenuOpen);
  const menuScrimStyle = useAnimatedStyle(() => ({ opacity: menuModal.progress.value }));
  const menuCardStyle = useAnimatedStyle(() => ({
    opacity: menuModal.progress.value,
    transform: [{ translateY: interpolate(menuModal.progress.value, [0, 1], [24, 0]) }],
  }));
  const listsScrimStyle = useAnimatedStyle(() => ({ opacity: listsModal.progress.value }));
  const listsCardStyle = useAnimatedStyle(() => ({
    opacity: listsModal.progress.value,
    transform: [{ translateY: interpolate(listsModal.progress.value, [0, 1], [24, 0]) }],
  }));

  useFocusEffect(
    useCallback(() => {
      loadToday();
      loadHabits();

      if (useOnboardingStore.getState().takeFirstHabitIntent())
        useCreateSheetStore.getState().open();
    }, [loadToday, loadHabits]),
  );

  const doneCount = today.filter((entry) => entry.completedToday).length;
  const celebrating = useDayComplete(doneCount, today.length);

  const filteredToday = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return today
      .filter((entry) => query.length === 0 || entry.habit.name.toLowerCase().includes(query))
      .filter((entry) => {
        if (listFilter === "withTasks") return entry.tasks.length > 0;
        if (listFilter === "completed") return entry.completedToday;
        return true;
      });
  }, [today, searchQuery, listFilter]);

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

  const onToggleTask = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleTask(id);
    },
    [toggleTask],
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

  const onEditTask = (task: TaskWithState) => {
    setEditingTask(task);
  };

  const viewingTaskHabitColor =
    viewingTask &&
    today.find((entry) => entry.habit.id === viewingTask.habitId)?.habit.color;

  const hasAnyHabits = habits.length > 0;
  const isSearching = searchOpen && searchQuery.trim().length > 0;
  const isFiltered = isSearching || listFilter !== "all";

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
        keyboardShouldPersistTaps="handled"
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
            <PressableScale
              onPress={() => setListsMenuOpen(true)}
              disabled={today.length === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: today.length === 0 }}
              accessibilityLabel={strings.today.listsButton}
              style={{
                width: 32,
                height: 32,
                borderRadius: theme.radius.full,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: listFilter !== "all" ? theme.colors.accent.subtle : "transparent",
                opacity: today.length === 0 ? 0.35 : 1,
              }}
            >
              <Icon
                name="habits"
                size={16}
                color={listFilter !== "all" ? theme.colors.accent.default : theme.colors.text.secondary}
              />
            </PressableScale>
          </View>
        </Enter>

        {searchOpen ? (
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={strings.today.searchPlaceholder}
            autoFocus
          />
        ) : null}

        {isLoading ? null : today.length === 0 ? (
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

            {isFiltered && filteredToday.length === 0 ? (
              <EmptyState
                title={strings.today.noResultsTitle}
                message={
                  isSearching
                    ? strings.today.noResultsMessage(searchQuery.trim())
                    : strings.today.listFilterEmptyMessage
                }
              />
            ) : (
            <View>
              <Animated.View style={listStyle}>
                <Enter index={3}>
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
                    onToggle={() => {}}
                    onReorder={reorder}
                    slot={HABIT_ROW_HEIGHT + CARD_GAP}
                    separators={false}
                    canExpand={(entry) => entry.tasks.length > 0}
                    renderExpanded={(entry) => (
                      <View
                        style={{
                          gap: theme.spacing.sm,
                          paddingHorizontal: theme.spacing.md,
                          paddingBottom: theme.spacing.md,
                          paddingTop: theme.spacing.xs,
                        }}
                      >
                        {entry.tasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            habitColor={entry.habit.color}
                            onToggle={onToggleTask}
                            onPress={setViewingTask}
                            onEdit={onEditTask}
                            onDelete={setPendingDeleteTask}
                            removing={task.id === removingTaskId}
                          />
                        ))}
                      </View>
                    )}
                    renderItem={(entry, { expanded }) => (
                      <View style={{ paddingBottom: CARD_GAP, position: "relative" }}>
                        <HabitRow
                          habit={entry.habit}
                          subtitle={subtitleFor(entry)}
                          subtitleIcon={subtitleIcon}
                          streakCount={entry.streaks.current}
                          completed={entry.completedToday}
                          taskProgress={entry.taskProgress}
                          onToggle={() => onToggle(entry.habit.id)}
                          expandable={entry.tasks.length > 0 || expanded}
                          expanded={expanded}
                        />
                        {!expanded ? (
                          <View
                            pointerEvents="none"
                            style={{
                              position: "absolute",
                              left: theme.spacing.lg,
                              right: theme.spacing.lg,
                              bottom: (CARD_GAP - 1) / 2,
                              height: 1,
                              backgroundColor: theme.colors.border.default,
                              opacity: 0.6,
                            }}
                          />
                        ) : null}
                      </View>
                    )}
                  />
                </Enter>
              </Animated.View>

              <DayCompleteOverlay visible={celebrating} />
            </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={menuModal.shouldRender}
        transparent
        animationType="none"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: theme.colors.surface.scrim,
              justifyContent: "flex-end",
              padding: theme.spacing.md,
            },
            menuScrimStyle,
          ]}
        >
          <Pressable
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setMenuOpen(false)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          <Animated.View style={menuCardStyle}>
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
          </Animated.View>
        </Animated.View>
      </Modal>

      <Modal
        visible={listsModal.shouldRender}
        transparent
        animationType="none"
        onRequestClose={() => setListsMenuOpen(false)}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: theme.colors.surface.scrim,
              justifyContent: "flex-end",
              padding: theme.spacing.md,
            },
            listsScrimStyle,
          ]}
        >
          <Pressable
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={() => setListsMenuOpen(false)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          <Animated.View style={listsCardStyle}>
          <View
            style={{
              borderRadius: theme.radius.xl,
              backgroundColor: theme.colors.surface.secondary,
              overflow: "hidden",
              marginBottom: insets.bottom,
            }}
          >
            <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xs }}>
              <ThemedText variant="footnote" color="secondary" style={{ fontWeight: "600" }}>
                {strings.today.listFilterTitle.toUpperCase()}
              </ThemedText>
            </View>
            {(
              [
                ["all", strings.today.listFilterAll],
                ["withTasks", strings.today.listFilterWithTasks],
                ["completed", strings.today.listFilterCompleted],
              ] as [ListFilter, string][]
            ).map(([value, label], index) => {
              const selected = listFilter === value;
              return (
                <View key={value}>
                  {index > 0 ? (
                    <View style={{ height: 1, backgroundColor: theme.colors.border.default }} />
                  ) : null}
                  <PressableScale
                    onPress={() => {
                      setListFilter(value);
                      setListsMenuOpen(false);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: theme.spacing.md,
                      paddingHorizontal: theme.spacing.md,
                      minHeight: 52,
                    }}
                  >
                    <ThemedText
                      variant="body"
                      style={{
                        flex: 1,
                        fontWeight: selected ? "600" : "400",
                        color: selected ? theme.colors.accent.default : theme.colors.text.primary,
                      }}
                    >
                      {label}
                    </ThemedText>
                    {selected ? (
                      <Icon name="check" size={16} color={theme.colors.accent.default} />
                    ) : null}
                  </PressableScale>
                </View>
              );
            })}
          </View>

          <PressableScale
            onPress={() => setListsMenuOpen(false)}
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
          </Animated.View>
        </Animated.View>
      </Modal>

      <ConfirmDialog
        visible={pendingDeleteTask !== null}
        title={strings.todayTasks.deleteTitle(pendingDeleteTask?.name ?? "")}
        message={strings.todayTasks.deleteMessage}
        confirmLabel={strings.todayTasks.deleteConfirm}
        cancelLabel={strings.todayTasks.cancel}
        icon="trash"
        iconColor="red"
        destructive
        onConfirm={() => {
          const target = pendingDeleteTask;
          setPendingDeleteTask(null);
          if (!target) return;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setRemovingTaskId(target.id);
          setTimeout(() => {
            deleteTask(target.id);
            setRemovingTaskId(null);
          }, theme.motion.duration.listItemExit);
          setTimeout(() => {
            useSuccessOverlayStore.getState().show(strings.todayTasks.deletedMessage, "trash");
          }, theme.motion.duration.default);
        }}
        onDismiss={() => setPendingDeleteTask(null)}
      />

      <TaskDetailSheet
        task={viewingTask}
        habitColor={viewingTask?.color ?? viewingTaskHabitColor ?? "blue"}
        onClose={() => setViewingTask(null)}
        onEdit={(task) => {
          setViewingTask(null);
          onEditTask(task);
        }}
      />

      <TaskEditSheet task={editingTask} onClose={() => setEditingTask(null)} />

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
