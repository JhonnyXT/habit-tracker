import { useColorScheme } from 'react-native';

import { colors, type ColorScheme } from '@/core/theme/colors';
import { spacing, radius } from '@/core/theme/spacing';
import { typography } from '@/core/theme/typography';
import { spring, duration, pressScale } from '@/core/theme/motion';

let manualOverride: ColorScheme | null = null;

export function setAppearanceOverride(scheme: ColorScheme | null) {
  manualOverride = scheme;
}

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = manualOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');

  return {
    scheme,
    colors: colors[scheme],
    spacing,
    radius,
    typography,
    motion: { spring, duration, pressScale },
  };
}
