import { create } from 'zustand';

import type { AppearanceScheme } from '@/core/domain/appearance';

type AppearanceState = {
  scheme: AppearanceScheme;
  setScheme: (scheme: AppearanceScheme) => void;
};

export const useAppearanceStore = create<AppearanceState>((set) => ({
  scheme: 'system',
  setScheme: (scheme) => set({ scheme }),
}));
