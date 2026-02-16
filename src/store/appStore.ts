import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitCategory } from '../types';

interface AppState {
  hasCompletedOnboarding: boolean;
  selectedCategories: HabitCategory[];
  userName: string;

  setOnboardingComplete: () => void;
  resetOnboarding: () => void;
  setSelectedCategories: (categories: HabitCategory[]) => void;
  setUserName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      selectedCategories: [],
      userName: 'Alexandre',

      setOnboardingComplete: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      setSelectedCategories: (categories) =>
        set({ selectedCategories: categories }),
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
