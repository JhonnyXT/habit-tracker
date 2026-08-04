import { Platform } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  largeTitle: {
    fontFamily: systemFont,
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.7,
    lineHeight: 40,
  },
  title: {
    fontFamily: systemFont,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  headline: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  subheadline: {
    fontFamily: systemFont,
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },
  footnote: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  caption: {
    fontFamily: systemFont,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 14,
  },

  sectionHeader: {
    fontFamily: systemFont,
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    lineHeight: 18,
  },

  statValue: {
    fontFamily: systemFont,
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
} as const;

export type TypeRole = keyof typeof typography;
