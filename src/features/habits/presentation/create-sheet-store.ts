import { create } from 'zustand';

type CreateSheetState = {
  visible: boolean;
  open: () => void;
  close: () => void;
};

export const useCreateSheetStore = create<CreateSheetState>((set) => ({
  visible: false,
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}));
