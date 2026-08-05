import type { PreferencesRepository } from '@/core/domain/preferences-repository';

export const appearanceSchemes = ['system', 'light', 'dark'] as const;
export type AppearanceScheme = (typeof appearanceSchemes)[number];

const APPEARANCE_KEY = 'appearance.scheme';

function isAppearanceScheme(value: string): value is AppearanceScheme {
  return (appearanceSchemes as readonly string[]).includes(value);
}

export function getAppearanceUseCase(preferences: PreferencesRepository) {
  return async (): Promise<AppearanceScheme> => {
    const stored = await preferences.get(APPEARANCE_KEY);
    return stored && isAppearanceScheme(stored) ? stored : 'system';
  };
}

export function setAppearanceUseCase(preferences: PreferencesRepository) {
  return (scheme: AppearanceScheme): Promise<void> => preferences.set(APPEARANCE_KEY, scheme);
}
