import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Badge, XPEvent } from '../types';
import { getToday } from '../utils/date';
import * as gamificationSync from '../services/sync/gamificationSync';
import { isOnline, queueOperation } from '../services/sync/offlineQueue';

function getUserId(): string | undefined {
  return require('./authStore').useAuthStore.getState().user?.id;
}

const XP_PER_HABIT = 10;
const XP_PER_LEVEL = 100;

export const BADGE_DEFINITIONS: Omit<Badge, 'unlockedAt'>[] = [
  {
    id: 'streak_7',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs',
    icon: 'flame',
    color: '#F97316',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Mois de Fer',
    description: '30 jours consécutifs',
    icon: 'shield-checkmark',
    color: '#EAB308',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: '100 jours consécutifs',
    icon: 'diamond',
    color: '#8B5CF6',
    requirement: { type: 'streak', value: 100 },
  },
  {
    id: 'total_50',
    name: 'Démarrage',
    description: '50 habitudes complétées',
    icon: 'rocket',
    color: '#3B82F6',
    requirement: { type: 'total_completions', value: 50 },
  },
  {
    id: 'total_100',
    name: 'Centenaire',
    description: '100 habitudes complétées',
    icon: 'star',
    color: '#10B981',
    requirement: { type: 'total_completions', value: 100 },
  },
  {
    id: 'total_500',
    name: 'Légende',
    description: '500 habitudes complétées',
    icon: 'trophy',
    color: '#EC4899',
    requirement: { type: 'total_completions', value: 500 },
  },
  {
    id: 'monthly_90',
    name: 'Excellence',
    description: '90% de taux mensuel',
    icon: 'medal',
    color: '#14B8A6',
    requirement: { type: 'monthly_rate', value: 0.9 },
  },
  {
    id: 'monthly_100',
    name: 'Perfection',
    description: '100% de taux mensuel',
    icon: 'ribbon',
    color: '#F59E0B',
    requirement: { type: 'monthly_rate', value: 1.0 },
  },
];

interface GamificationState {
  xp: number;
  level: number;
  totalXP: number;
  xpHistory: XPEvent[];
  unlockedBadges: Badge[];
  showLevelUpModal: boolean;
  lastLevelUp: number | null;

  // Actions
  addXP: (amount: number, reason: string) => void;
  checkAndUnlockBadge: (badgeId: string) => boolean;
  unlockBadge: (badgeId: string) => void;
  dismissLevelUp: () => void;
  getXPForNextLevel: () => number;
  getXPProgress: () => number;
  isBadgeUnlocked: (badgeId: string) => boolean;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      totalXP: 0,
      xpHistory: [],
      unlockedBadges: [],
      showLevelUpModal: false,
      lastLevelUp: null,

      addXP: (amount, reason) => {
        const currentXP = get().xp + amount;
        const currentLevel = get().level;
        const newLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
        const leveledUp = newLevel > currentLevel;
        const today = getToday();

        set((state) => ({
          xp: currentXP,
          totalXP: state.totalXP + amount,
          level: newLevel,
          xpHistory: [
            { amount, reason, date: today },
            ...state.xpHistory.slice(0, 99), // Keep last 100
          ],
          showLevelUpModal: leveledUp,
          lastLevelUp: leveledUp ? newLevel : state.lastLevelUp,
        }));

        // Sync Supabase (avec file d'attente hors ligne)
        const userId = getUserId();
        if (userId) {
          const state = get();
          isOnline().then((online) => {
            if (online) {
              gamificationSync.upsertGamification(userId, state.xp, state.level, state.totalXP).catch(console.error);
              gamificationSync.insertXPEvent(userId, { amount, reason, date: today }).catch(console.error);
            } else {
              queueOperation({
                type: 'gamification',
                action: 'update',
                data: { xp: state.xp, level: state.level, totalXP: state.totalXP },
              }).catch(console.error);
              queueOperation({
                type: 'gamification',
                action: 'create',
                data: { event: { amount, reason, date: today } },
              }).catch(console.error);
            }
          });
        }
      },

      checkAndUnlockBadge: (badgeId) => {
        if (get().unlockedBadges.some((b) => b.id === badgeId)) return false;
        const definition = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
        if (!definition) return false;
        get().unlockBadge(badgeId);
        return true;
      },

      unlockBadge: (badgeId) => {
        const definition = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
        if (!definition) return;
        if (get().unlockedBadges.some((b) => b.id === badgeId)) return;

        const badge: Badge = {
          ...definition,
          unlockedAt: new Date().toISOString(),
        };

        set((state) => ({
          unlockedBadges: [...state.unlockedBadges, badge],
        }));

        // Sync badge vers Supabase
        const userId = getUserId();
        if (userId) gamificationSync.upsertBadge(userId, badge).catch(console.error);

        // Bonus XP for badge
        get().addXP(50, `Badge débloqué : ${definition.name}`);
      },

      dismissLevelUp: () => set({ showLevelUpModal: false }),

      getXPForNextLevel: () => {
        return XP_PER_LEVEL;
      },

      getXPProgress: () => {
        return (get().xp % XP_PER_LEVEL) / XP_PER_LEVEL;
      },

      isBadgeUnlocked: (badgeId) => {
        return get().unlockedBadges.some((b) => b.id === badgeId);
      },
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export { XP_PER_HABIT, XP_PER_LEVEL };
