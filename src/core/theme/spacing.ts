import { Platform } from 'react-native';

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
  sm: 8,
  md: 12,

  lg: Platform.select({ ios: 24, default: 16 }),

  xl: 24,

  full: 999,
} as const;

export const minTouchTarget = {
  ios: 44,
  android: 48,
} as const;
