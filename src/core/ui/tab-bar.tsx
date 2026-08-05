import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '@/core/theme';
import { Icon } from '@/core/ui/icon';
import type { IconName } from '@/core/ui/icons';
import { PressableScale } from '@/core/ui/pressable-scale';
import { ThemedText } from '@/core/ui/themed-text';

const tabIcons: Record<string, IconName> = {
  index: 'checkCircle',
  habits: 'streak',
  settings: 'settings',
};

export const TAB_BAR_HEIGHT = 60;

// Today has a "+" FAB floating to the right of the tab bar (see
// (tabs)/index.tsx). Reserving this much width on that side keeps the
// [tab bar + FAB] group centered as one unit on that screen, instead of the
// tab bar centering itself across the full width and reading as off-center
// once the FAB's extra footprint is added next to it.
const FAB_RESERVED_WIDTH = 80;
const screensWithFab = new Set(['index']);

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const reserveForFab = screensWithFab.has(state.routeNames[state.index]);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: reserveForFab ? FAB_RESERVED_WIDTH : 0,
        bottom: insets.bottom + theme.spacing.sm,
        alignItems: 'center',
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
    </View>
  );
}
