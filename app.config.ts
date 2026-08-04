import type { ExpoConfig } from 'expo/config';

type Variant = 'dev' | 'test' | 'prod';

const variants = {
  dev: {
    name: 'Habit Tracker (Dev)',
    package: 'com.habittracker.app',
    scheme: 'habittracker',
    iconBackground: '#E6F4FE',
  },
  test: {
    name: 'Habit Tracker (Test)',
    package: 'com.habittracker.app.test',
    scheme: 'habittracker-test',
    iconBackground: '#FFE0B2',
  },
  prod: {
    name: 'Habit Tracker',
    package: 'com.habittracker',
    scheme: 'habittracker-prod',
    iconBackground: '#DDE3EA',
  },
} as const satisfies Record<Variant, unknown>;

function resolveVariant(): Variant {
  const value = process.env.APP_VARIANT ?? 'dev';
  if (value in variants) return value as Variant;
  throw new Error(`Unknown APP_VARIANT "${value}". Expected one of: ${Object.keys(variants).join(', ')}`);
}

const variant = resolveVariant();
const current = variants[variant];

const config: ExpoConfig = {
  name: current.name,
  slug: 'habit-tracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: current.scheme,
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: current.iconBackground,
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: true,
    package: current.package,
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-sqlite',
    'expo-notifications',
    '@react-native-community/datetimepicker',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appVariant: variant,
  },
};

export default config;
