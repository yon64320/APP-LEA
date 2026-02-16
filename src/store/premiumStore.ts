import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PremiumPlan } from '../types';

const FREE_HABIT_LIMIT = 5;
const PREMIUM_STREAK_PROTECTIONS = 1; // per week

interface PremiumState {
  plan: PremiumPlan;
  expiresAt: string | null;
  streakProtectionsUsed: number;
  lastProtectionReset: string | null;

  isPremium: () => boolean;
  canAddHabit: (currentCount: number) => boolean;
  canUseStreakProtection: () => boolean;
  useStreakProtection: () => void;
  setPlan: (plan: PremiumPlan) => void;
  getHabitLimit: () => number | null;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set, get) => ({
      plan: 'free' as PremiumPlan,
      expiresAt: null,
      streakProtectionsUsed: 0,
      lastProtectionReset: null,

      isPremium: () => {
        const { plan, expiresAt } = get();
        if (plan === 'free') return false;
        if (expiresAt && new Date(expiresAt) < new Date()) return false;
        return true;
      },

      canAddHabit: (currentCount) => {
        if (get().isPremium()) return true;
        return currentCount < FREE_HABIT_LIMIT;
      },

      canUseStreakProtection: () => {
        if (!get().isPremium()) return false;
        return get().streakProtectionsUsed < PREMIUM_STREAK_PROTECTIONS;
      },

      useStreakProtection: () => {
        set((state) => ({
          streakProtectionsUsed: state.streakProtectionsUsed + 1,
        }));
      },

      setPlan: (plan) => {
        const expiresAt =
          plan === 'free'
            ? null
            : plan === 'monthly'
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        set({ plan, expiresAt, streakProtectionsUsed: 0 });
      },

      getHabitLimit: () => {
        return get().isPremium() ? null : FREE_HABIT_LIMIT;
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { FREE_HABIT_LIMIT };
