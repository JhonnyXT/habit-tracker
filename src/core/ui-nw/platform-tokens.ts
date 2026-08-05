import { Platform } from 'react-native';

export const platform = {
  cardRadius: Platform.select({ ios: 'rounded-3xl', default: 'rounded-2xl' }),
  iconRadius: Platform.select({ ios: 'rounded-xl', default: 'rounded-full' }),
  pillRadius: Platform.select({ ios: 'rounded-2xl', default: 'rounded-xl' }),
  cardShadow: Platform.select({ ios: 'shadow-sm shadow-black/10', default: '' }),
  pressFeedback: Platform.select({ ios: 'active:opacity-70', default: '' }),
} as const;

export function rippleColor(scheme: 'light' | 'dark' | undefined) {
  return scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
}

export type IconWellTone = 'primary' | 'success' | 'danger' | 'neutral';

const iconWellHex: Record<IconWellTone, { light: string; dark: string }> = {
  primary: { light: '#E85D26', dark: '#F3924A' },
  success: { light: '#16A34A', dark: '#4ADE80' },
  danger: { light: '#E5484D', dark: '#F2555A' },
  neutral: { light: '#6E6E76', dark: '#9B9BA3' },
};

const iconWellBg: Record<IconWellTone, string> = {
  primary: 'bg-primary-500/15',
  success: 'bg-green-500/15',
  danger: 'bg-danger-500/15',
  neutral: 'bg-neutral-400/15 dark:bg-neutral-500/20',
};

export function iconWellColor(tone: IconWellTone, scheme: 'light' | 'dark' | undefined) {
  return scheme === 'dark' ? iconWellHex[tone].dark : iconWellHex[tone].light;
}

export function iconWellClassName(tone: IconWellTone) {
  return iconWellBg[tone];
}
