import { useCallback, useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { appVersion } from '@/core/config';
import { getUseCases } from '@/core/di';
import { ThemedText, Card, SectionHeader, Divider, ListRow, Enter, ConfirmDialog } from '@/core/ui';
import type { BackupFile } from '@/core/domain/backup';
import { useHabitsStore } from '@/features/habits/presentation/store';
import type { NotificationPermission } from '@/features/reminders/domain/notification-scheduler';

const permissionLabels: Record<NotificationPermission, string> = {
  granted: strings.settings.permissionGranted,
  denied: strings.settings.permissionDenied,
  undetermined: strings.settings.permissionNotRequested,
};

type Dialog =
  | { kind: 'none' }
  | { kind: 'deleteAll' }
  | { kind: 'restore'; file: BackupFile }
  | { kind: 'notice'; title: string; message: string };

export default function SettingsScreen() {
  const theme = useAppTheme();
  const rowInset = theme.spacing.md * 2 + 30;
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' });
  const [busy, setBusy] = useState(false);
  const loadToday = useHabitsStore((state) => state.loadToday);
  const loadHabits = useHabitsStore((state) => state.loadHabits);

  useFocusEffect(
    useCallback(() => {
      getUseCases().then(async (useCases) =>
        setPermission(await useCases.getNotificationPermission()),
      );
    }, []),
  );

  const closeDialog = () => setDialog({ kind: 'none' });

  const notice = (title: string, message: string) => setDialog({ kind: 'notice', title, message });

  const onDeleteAll = async () => {
    closeDialog();
    const useCases = await getUseCases();
    await useCases.deleteAllData();
    await Promise.all([loadToday(), loadHabits()]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const onExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const useCases = await getUseCases();
      const result = await useCases.exportData();
      if (result.status === 'empty') {
        notice(strings.settings.exportEmptyTitle, strings.settings.exportEmptyMessage);
      }
    } finally {
      setBusy(false);
    }
  };

  const onPickBackup = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const useCases = await getUseCases();
      const result = await useCases.readBackup();

      if (result.status === 'invalid') {
        notice(strings.settings.restoreFailedTitle, strings.settings.restoreFailed[result.code]);
        return;
      }

      if (result.status === 'valid') setDialog({ kind: 'restore', file: result.file });
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async (file: BackupFile) => {
    closeDialog();
    const useCases = await getUseCases();
    await useCases.restoreBackup(file);
    await useCases.syncReminders();
    await Promise.all([loadToday(), loadHabits()]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    notice(
      strings.settings.restoreDoneTitle,
      strings.settings.restoreDoneMessage(file.habits.length),
    );
  };

  const onPressPermission = async () => {
    if (permission === 'granted') {
      Linking.openSettings();
      return;
    }

    const useCases = await getUseCases();
    const next = await useCases.requestNotificationPermission();
    setPermission(next);
    if (next === 'denied') Linking.openSettings();
    if (next === 'granted') await useCases.syncReminders();
  };

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
        <Enter index={0}>
          <ThemedText variant="largeTitle">{strings.settings.title}</ThemedText>
        </Enter>

        <Enter index={1}>
          <SectionHeader>{strings.settings.notifications}</SectionHeader>
          <Card padded={false}>
            <ListRow
              label={strings.settings.permission}
              icon="bell"
              iconColor={
                permission === 'granted' ? theme.colors.state.success : theme.colors.state.danger
              }
              detail={permissionLabels[permission]}
              onPress={onPressPermission}
              showChevron
            />
          </Card>
        </Enter>

        <Enter index={2}>
          <SectionHeader>{strings.settings.backup}</SectionHeader>
          <Card padded={false}>
            <ListRow
              label={strings.settings.exportBackup}
              icon="export"
              iconColor={theme.colors.accent.default}
              onPress={onExport}
              showChevron
            />
            <Divider inset={rowInset} />
            <ListRow
              label={strings.settings.restoreBackup}
              icon="restore"
              iconColor={theme.colors.habit.orange.solid}
              onPress={onPickBackup}
              showChevron
            />
          </Card>
          <ThemedText
            variant="footnote"
            color="secondary"
            style={{ marginTop: theme.spacing.sm, marginHorizontal: theme.spacing.xs }}
          >
            {strings.settings.backupNote}
          </ThemedText>
        </Enter>

        <Enter index={3}>
          <SectionHeader>{strings.settings.data}</SectionHeader>
          <Card padded={false}>
            <ListRow
              label={strings.settings.deleteAll}
              icon="trash"
              iconColor={theme.colors.state.danger}
              destructive
              onPress={() => setDialog({ kind: 'deleteAll' })}
              showChevron
            />
          </Card>
        </Enter>

        <Enter index={4}>
          <SectionHeader>{strings.settings.about}</SectionHeader>
          <Card padded={false}>
            <ListRow
              label={strings.settings.version}
              icon="info"
              iconColor={theme.colors.text.secondary}
              detail={appVersion}
            />
          </Card>
        </Enter>
      </ScrollView>

      <ConfirmDialog
        visible={dialog.kind === 'deleteAll'}
        title={strings.settings.deleteAllTitle}
        message={strings.settings.deleteAllMessage}
        confirmLabel={strings.settings.deleteAllConfirm}
        cancelLabel={strings.settings.cancel}
        icon="trash"
        iconColor="red"
        destructive
        onConfirm={onDeleteAll}
        onDismiss={closeDialog}
      />

      <ConfirmDialog
        visible={dialog.kind === 'restore'}
        title={strings.settings.restoreTitle}
        message={
          dialog.kind === 'restore'
            ? strings.settings.restoreMessage(
                dialog.file.habits.length,
                dialog.file.completions.length,
              )
            : ''
        }
        confirmLabel={strings.settings.restoreConfirm}
        cancelLabel={strings.settings.cancel}
        icon="restore"
        iconColor="orange"
        destructive
        onConfirm={() => {
          if (dialog.kind === 'restore') onRestore(dialog.file);
        }}
        onDismiss={closeDialog}
      />

      <ConfirmDialog
        visible={dialog.kind === 'notice'}
        title={dialog.kind === 'notice' ? dialog.title : ''}
        message={dialog.kind === 'notice' ? dialog.message : ''}
        confirmLabel={strings.settings.close}
        onConfirm={closeDialog}
        onDismiss={closeDialog}
      />
    </SafeAreaView>
  );
}
