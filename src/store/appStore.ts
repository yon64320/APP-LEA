import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitCategory } from '../types';
import { requireSupabase } from '../lib/supabase';
import { getUserId } from '../utils/getUserId';

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
      setUserName: async (name) => {
        set({ userName: name });
        // Sync username to Supabase profile
        const userId = getUserId();
        if (userId) {
          try {
            const supabase = requireSupabase();
            supabase
              .from('profiles')
              .update({ user_name: name, updated_at: new Date().toISOString() })
              .eq('id', userId)
              .then(({ error }) => {
                if (error) console.error('Error updating profile:', error);
              });
          } catch (e) {
            // Supabase non configuré, ignorer
          }
        }
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
