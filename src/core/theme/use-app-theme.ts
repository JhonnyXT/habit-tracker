import { useColorScheme } from 'react-native';

import { colors, type ColorScheme } from '@/core/theme/colors';
import { spacing, radius } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';
import { spring, duration, pressScale } from '@/core/theme/motion';
import { useAppearanceStore } from '@/core/theme/appearance-store';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const override = useAppearanceStore((state) => state.scheme);
  const resolvedSystem: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const scheme: ColorScheme = override === 'system' ? resolvedSystem : override;

  return {
    scheme,
    colors: colors[scheme],
    spacing,
    radius,
    typography,
    motion: { spring, duration, pressScale },
  };
}
