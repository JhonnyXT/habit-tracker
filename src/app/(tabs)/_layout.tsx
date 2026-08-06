import { Tabs } from 'expo-router';

import { TabBar } from '@/core/ui';
import { strings } from '@/core/i18n';
import { CreateSheet } from '@/features/habits/presentation/components/create-sheet';

export default function TabsLayout() {
  return (
    <>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
        <Tabs.Screen name="index" options={{ title: strings.tabs.today }} />
        <Tabs.Screen name="habits" options={{ title: strings.tabs.habits }} />
        <Tabs.Screen name="settings" options={{ title: strings.tabs.settings }} />
      </Tabs>
      <CreateSheet />
    </>
  );
}
