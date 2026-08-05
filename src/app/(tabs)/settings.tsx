import { useCallback, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useAppearanceStore } from '@/core/theme/appearance-store';
import type { AppearanceScheme } from '@/core/domain/appearance';
import { strings } from '@/core/i18n';
import { appVersion } from '@/core/config';
import { getUseCases } from '@/core/di';
import { ConfirmDialog, Enter } from '@/core/ui';
import { SettingsContainer } from '@/core/ui-nw/settings-container';
import { SettingsItem } from '@/core/ui-nw/settings-item';
import { SegmentedControl } from '@/core/ui-nw/segmented-control';
import type { BackupFile } from '@/core/domain/backup';
import { useHabitsStore } from '@/features/habits/presentation/store';
import type { NotificationPermission } from '@/features/reminders/domain/notification-scheduler';

const appearanceOptions: { value: AppearanceScheme; label: string }[] = [
  { value: 'system', label: strings.settings.appearanceSystem },
  { value: 'light', label: strings.settings.appearanceLight },
  { value: 'dark', label: strings.settings.appearanceDark },
];

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
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const [dialog, setDialog] = useState<Dialog>({ kind: 'none' });
  const [busy, setBusy] = useState(false);
  const loadToday = useHabitsStore((state) => state.loadToday);
  const loadHabits = useHabitsStore((state) => state.loadHabits);
  const appearance = useAppearanceStore((state) => state.scheme);
  const setAppearanceScheme = useAppearanceStore((state) => state.setScheme);

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

  const onChangeAppearance = async (scheme: AppearanceScheme) => {
    Haptics.selectionAsync();
    setAppearanceScheme(scheme);
    const useCases = await getUseCases();
    await useCases.setAppearance(scheme);
  };

  const onExportExcel = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const useCases = await getUseCases();
      const result = await useCases.exportSpreadsheet();
      if (result.status === 'empty') {
        notice(strings.settings.exportEmptyTitle, strings.settings.exportEmptyMessage);
      }
    } finally {
      setBusy(false);
    }
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
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-black" edges={['top']}>
      <ScrollView
        contentContainerClassName="gap-6 p-4 pb-24"
        showsVerticalScrollIndicator={false}
      >
        <Enter index={0}>
          <Text className="text-[34px] leading-[40px] tracking-[-0.7px] font-bold text-neutral-900 dark:text-neutral-50">
            {strings.settings.title}
          </Text>
        </Enter>

        <Enter index={1}>
          <View className="gap-2">
            <Text className="ml-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {strings.settings.appearance}
            </Text>
            <SegmentedControl
              accessibilityLabel={strings.settings.appearance}
              value={appearance}
              onChange={onChangeAppearance}
              options={appearanceOptions}
            />
          </View>
        </Enter>

        <Enter index={2}>
          <SettingsContainer title={strings.settings.notifications}>
            <SettingsItem
              label={strings.settings.permission}
              icon="bell"
              tone={permission === 'granted' ? 'success' : 'danger'}
              detail={permissionLabels[permission]}
              onPress={onPressPermission}
              showChevron
              isLast
            />
          </SettingsContainer>
        </Enter>

        <Enter index={3}>
          <View className="gap-3">
            <SettingsContainer title={strings.settings.backup}>
              <SettingsItem
                label={strings.settings.exportBackup}
                icon="export"
                tone="primary"
                onPress={onExport}
                showChevron
              />
              <SettingsItem
                label={strings.settings.restoreBackup}
                icon="restore"
                tone="primary"
                onPress={onPickBackup}
                showChevron
                isLast
              />
            </SettingsContainer>
            <Text className="mx-1 text-[13px] leading-[18px] text-neutral-500 dark:text-neutral-400">
              {strings.settings.backupNote}
            </Text>

            <SettingsContainer title={strings.settings.spreadsheetSection}>
              <SettingsItem
                label={strings.settings.exportExcel}
                icon="chart"
                tone="success"
                onPress={onExportExcel}
                showChevron
                isLast
              />
            </SettingsContainer>
            <Text className="mx-1 text-[13px] leading-[18px] text-neutral-500 dark:text-neutral-400">
              {strings.settings.exportExcelNote}
            </Text>
          </View>
        </Enter>

        <Enter index={4}>
          <SettingsContainer title={strings.settings.data}>
            <SettingsItem
              label={strings.settings.deleteAll}
              icon="trash"
              tone="danger"
              destructive
              onPress={() => setDialog({ kind: 'deleteAll' })}
              showChevron
              isLast
            />
          </SettingsContainer>
        </Enter>

        <Enter index={5}>
          <SettingsContainer title={strings.settings.about}>
            <SettingsItem
              label={strings.settings.version}
              icon="info"
              tone="neutral"
              detail={appVersion}
              isLast
            />
          </SettingsContainer>
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
