import { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { appVariant, appVersion, isProd } from '@/core/config';
import { getUseCases } from '@/core/di';
import { ThemedText, Card, SectionHeader, Divider, ListRow, Enter } from '@/core/ui';
import { useHabitsStore } from '@/features/habits/presentation/store';
import type { NotificationPermission } from '@/features/reminders/domain/notification-scheduler';

const permissionLabels: Record<NotificationPermission, string> = {
  granted: strings.settings.permissionGranted,
  denied: strings.settings.permissionDenied,
  undetermined: strings.settings.permissionNotRequested,
};

const variantLabels: Record<string, string> = {
  dev: strings.settings.buildVariantDev,
  test: strings.settings.buildVariantTest,
};

export default function SettingsScreen() {
  const theme = useAppTheme();
  const rowInset = theme.spacing.md * 2 + 30;
  const [permission, setPermission] = useState<NotificationPermission>('undetermined');
  const loadToday = useHabitsStore((state) => state.loadToday);
  const loadHabits = useHabitsStore((state) => state.loadHabits);

  useFocusEffect(
    useCallback(() => {
      getUseCases().then(async (useCases) =>
        setPermission(await useCases.getNotificationPermission()),
      );
    }, []),
  );

  const onDeleteAll = () => {
    Alert.alert(strings.settings.deleteAllTitle, strings.settings.deleteAllMessage, [
      { text: strings.settings.cancel, style: 'cancel' },
      {
        text: strings.settings.deleteAllConfirm,
        style: 'destructive',
        onPress: async () => {
          const useCases = await getUseCases();
          await useCases.deleteAllData();
          await Promise.all([loadToday(), loadHabits()]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
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
              showChevron
            />
            <Divider inset={rowInset} />
            <ListRow
              label={strings.settings.restoreBackup}
              icon="restore"
              iconColor={theme.colors.habit.orange.solid}
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
              onPress={onDeleteAll}
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
            {!isProd && (
              <>
                <Divider inset={rowInset} />
                <ListRow
                  label={strings.settings.buildVariant}
                  icon="info"
                  iconColor={theme.colors.text.secondary}
                  detail={variantLabels[appVariant]}
                />
              </>
            )}
          </Card>
        </Enter>
      </ScrollView>
    </SafeAreaView>
  );
}
