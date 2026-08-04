export const habitColorTokens = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
] as const;

export type HabitColorToken = (typeof habitColorTokens)[number];

type HabitColor = { solid: string; tint: string };

const habitLight: Record<HabitColorToken, HabitColor> = {
  red: { solid: '#E5484D', tint: '#FBE0E0' },
  orange: { solid: '#E8802A', tint: '#FCE9DA' },
  yellow: { solid: '#D8A400', tint: '#FAF0D2' },
  green: { solid: '#2E9E5B', tint: '#DDF1E5' },
  teal: { solid: '#1F9C8F', tint: '#D9F0ED' },
  blue: { solid: '#2563EB', tint: '#DEE8FD' },
  purple: { solid: '#6D5AE0', tint: '#E5E1FB' },
  pink: { solid: '#E0568A', tint: '#FBE0EA' },
};

const habitDark: Record<HabitColorToken, HabitColor> = {
  red: { solid: '#F2555A', tint: '#3A1B1D' },
  orange: { solid: '#F3924A', tint: '#3A2617' },
  yellow: { solid: '#E8B92E', tint: '#372C10' },
  green: { solid: '#3FBE72', tint: '#12301F' },
  teal: { solid: '#33B8AA', tint: '#0F2F2C' },
  blue: { solid: '#5C93FF', tint: '#16233D' },
  purple: { solid: '#9A75EE', tint: '#241C3F' },
  pink: { solid: '#F06FA0', tint: '#3A1826' },
};

export const colors = {
  light: {
    surface: {
      primary: '#F2F2F7',

      secondary: '#FFFFFF',

      elevated: '#EFEFF1',

      scrim: 'rgba(0, 0, 0, 0.4)',
    },
    text: {
      primary: '#111113',
      secondary: '#6E6E76',

      accent: '#8B6F3F',

      onSolid: '#FFFFFF',
    },
    border: {
      default: '#E2E2E6',
    },
    accent: {
      default: '#E85D26',
      subtle: '#FDEDE5',
    },
    habit: habitLight,
    state: {
      success: '#2FA84F',
      warning: '#D8A400',
      danger: '#E5484D',
      dangerSubtle: '#FBE8E8',
    },
  },
  dark: {
    surface: {
      primary: '#000000',
      secondary: '#1C1C1F',
      elevated: '#2A2A2E',

      scrim: 'rgba(0, 0, 0, 0.6)',
    },
    text: {
      primary: '#F2F2F4',
      secondary: '#9B9BA3',
      accent: '#C4A265',
      onSolid: '#FFFFFF',
    },
    border: {
      default: '#2E2E33',
    },
    accent: {
      default: '#FF884D',
      subtle: '#3A2016',
    },
    habit: habitDark,
    state: {
      success: '#3FBE72',
      warning: '#E8B92E',
      danger: '#F2555A',
      dangerSubtle: '#3A1B1D',
    },
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ResolvedColors = (typeof colors)[ColorScheme];
