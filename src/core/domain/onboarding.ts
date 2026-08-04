import type { PreferencesRepository } from '@/core/domain/preferences-repository';

const ONBOARDING_SEEN = 'onboarding.seen';

export function hasSeenOnboardingUseCase(preferences: PreferencesRepository) {
  return async (): Promise<boolean> => (await preferences.get(ONBOARDING_SEEN)) === 'true';
}

export function markOnboardingSeenUseCase(preferences: PreferencesRepository) {
  return (): Promise<void> => preferences.set(ONBOARDING_SEEN, 'true');
}
