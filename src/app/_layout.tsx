import '../../global.css';

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReducedMotionConfig, ReduceMotion } from 'react-native-reanimated';
import { colorScheme as nativewindColorScheme } from 'nativewind';

import { getDatabase } from '@/core/data';
import { getUseCases } from '@/core/di';
import { useAppTheme } from '@/core/theme';
import { useAppearanceStore } from '@/core/theme/appearance-store';
import { ThemedView } from '@/core/ui';
import { useOnboardingStore } from '@/features/onboarding/presentation/store';
import { useReminderNavigation } from '@/features/reminders/presentation/use-reminder-navigation';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useAppTheme();
  const [isReady, setIsReady] = useState(false);
  const pending = useOnboardingStore((state) => state.pending);
  const startOnboarding = useOnboardingStore((state) => state.start);
  const appearanceScheme = useAppearanceStore((state) => state.scheme);
  const setAppearanceScheme = useAppearanceStore((state) => state.setScheme);

  useReminderNavigation(isReady);

  useEffect(() => {
    nativewindColorScheme.set(appearanceScheme);
  }, [appearanceScheme]);

  useEffect(() => {
    (async () => {
      await getDatabase();

      const useCases = await getUseCases();
      const [seen, appearance] = await Promise.all([
        useCases.hasSeenOnboarding(),
        useCases.getAppearance(),
      ]);

      startOnboarding(!seen);
      setAppearanceScheme(appearance);
      setIsReady(true);

      requestAnimationFrame(() => SplashScreen.hideAsync());
    })();
  }, [startOnboarding, setAppearanceScheme]);

  useEffect(() => {
    if (!isReady) return;
    getUseCases().then((useCases) => useCases.syncReminders());
  }, [isReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.surface.primary }}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <ReducedMotionConfig mode={ReduceMotion.System} />
      {isReady ? (
        <Stack
          screenOptions={{
            headerShown: false,

            headerStyle: { backgroundColor: theme.colors.surface.primary },
            headerTintColor: theme.colors.accent.default,
            headerTitleStyle: {
              color: theme.colors.text.primary,
              fontSize: 17,
              fontWeight: '600',
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: theme.colors.surface.primary },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Protected guard={pending}>
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!pending}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="habit/[id]" />
            <Stack.Screen name="habit-form" options={{ presentation: 'modal' }} />
          </Stack.Protected>
        </Stack>
      ) : (
        <ThemedView style={{ flex: 1 }} />
      )}
    </GestureHandlerRootView>
  );
}
