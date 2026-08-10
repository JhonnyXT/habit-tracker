import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { strings } from '@/core/i18n';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';
import { useCreateSheetStore } from '@/features/habits/presentation/create-sheet-store';

const tabIcons: Record<string, IconName> = {
  index: 'checkCircle',
  habits: 'streak',
  settings: 'settings',
};

export const TAB_BAR_HEIGHT = 60;

// Today also shows a "+" FAB to add a habit. It's rendered here, as part of
// the same centered row as the tab pill, so the [pill + FAB] group is one
// flex-centered unit on the full screen width instead of two separately
// positioned elements that have to be reconciled by hand.
const screensWithFab = new Set(['index']);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const openCreateSheet = useCreateSheetStore((store) => store.open);
  const showFab = screensWithFab.has(state.routeNames[state.index]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + theme.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.xs,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surface.secondary,
          shadowColor: '#000',
          shadowOpacity: theme.scheme === 'dark' ? 0.5 : 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const color = focused ? theme.colors.accent.default : theme.colors.text.secondary;

          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              activeScale={0.92}
              onPress={() => {
                if (!focused) {
                  Haptics.selectionAsync();
                  navigation.navigate(route.name);
                }
              }}
              style={{
                minWidth: 62,
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                backgroundColor: focused ? theme.colors.accent.subtle : 'transparent',
              }}
            >
              <Icon name={tabIcons[route.name] ?? 'today'} size={19} color={color} />
              <ThemedText variant="caption" style={{ color, fontWeight: focused ? '600' : '400' }}>
                {label}
              </ThemedText>
            </PressableScale>
          );
        })}
      </View>

      {showFab ? (
        <PressableScale
          onPress={openCreateSheet}
          accessibilityRole="button"
          accessibilityLabel={strings.a11y.addHabit}
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surface.secondary,
            shadowColor: theme.scheme === 'dark' ? '#000' : theme.colors.text.primary,
            shadowOpacity: theme.scheme === 'dark' ? 0.25 : 0.1,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Icon name="add" size={24} color={theme.colors.accent.default} />
        </PressableScale>
      ) : null}
    </View>
  );
}
