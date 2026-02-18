import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveChallenge, Challenge, ChallengeStatus } from '../types';
import { getToday, addDays } from '../utils/date';
import { CHALLENGES } from '../constants/challenges';
import * as challengeSync from '../services/sync/challengeSync';
import { isOnline, queueOperation } from '../services/sync/offlineQueue';

function getUserId(): string | undefined {
  return require('./authStore').useAuthStore.getState().user?.id;
}

interface ChallengeState {
  activeChallenges: ActiveChallenge[];
  completedChallengeIds: string[];
  customChallenges: Challenge[];

  startChallenge: (challengeId: string, habitId: string, duration: number) => Promise<void>;
  updateChallengeProgress: (challengeId: string, completedDays: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  failChallenge: (challengeId: string) => void;
  abandonChallenge: (challengeId: string) => void;
  addCustomChallenge: (challenge: Omit<Challenge, 'id'>) => Promise<string>;
  getAllChallenges: () => Challenge[];
  getChallengeById: (challengeId: string) => Challenge | undefined;
  getActiveChallenge: (challengeId: string) => ActiveChallenge | undefined;
  isChallengeActive: (challengeId: string) => boolean;
  isChallengeCompleted: (challengeId: string) => boolean;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      activeChallenges: [],
      completedChallengeIds: [],
      customChallenges: [],

      startChallenge: async (challengeId, habitId, duration) => {
        const today = getToday();
        const endDate = addDays(today, duration);

        const active: ActiveChallenge = {
          challengeId,
          habitId,
          startDate: today,
          endDate,
          status: 'active',
          completedDays: 0,
        };

        set((state) => ({
          activeChallenges: [...state.activeChallenges, active],
        }));

        // Sync Supabase (avec file d'attente hors ligne)
        const userId = getUserId();
        if (userId) {
          const online = await isOnline();
          if (online) {
            challengeSync.upsertActiveChallenge(userId, active).catch(console.error);
          } else {
            queueOperation({
              type: 'challenge',
              action: 'create',
              data: active,
            }).catch(console.error);
          }
        }
      },

      updateChallengeProgress: async (challengeId, completedDays) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.challengeId === challengeId ? { ...c, completedDays } : c
          ),
        }));

        // Sync Supabase (avec file d'attente hors ligne)
        const userId = getUserId();
        if (userId) {
          const active = get().activeChallenges.find((c) => c.challengeId === challengeId);
          if (active) {
            const online = await isOnline();
            if (online) {
              challengeSync.upsertActiveChallenge(userId, active).catch(console.error);
            } else {
              queueOperation({
                type: 'challenge',
                action: 'update',
                data: active,
              }).catch(console.error);
            }
          }
        }
      },

      completeChallenge: async (challengeId) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.challengeId === challengeId
              ? { ...c, status: 'completed' as ChallengeStatus }
              : c
          ),
          completedChallengeIds: [...new Set([...state.completedChallengeIds, challengeId])],
        }));

        // Sync Supabase (avec file d'attente hors ligne)
        const userId = getUserId();
        if (userId) {
          const active = get().activeChallenges.find((c) => c.challengeId === challengeId);
          const online = await isOnline();
          if (online) {
            if (active) challengeSync.upsertActiveChallenge(userId, active).catch(console.error);
            challengeSync.upsertCompletedChallenge(userId, challengeId).catch(console.error);
          } else {
            if (active) {
              queueOperation({
                type: 'challenge',
                action: 'update',
                data: active,
              }).catch(console.error);
            }
            queueOperation({
              type: 'challenge',
              action: 'create',
              data: { challengeId, type: 'completed' },
            }).catch(console.error);
          }
        }
      },

      failChallenge: (challengeId) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.challengeId === challengeId
              ? { ...c, status: 'failed' as ChallengeStatus }
              : c
          ),
        }));
      },

      abandonChallenge: (challengeId) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.filter((c) => c.challengeId !== challengeId),
        }));
      },

      addCustomChallenge: async (challenge) => {
        const challengeId = `custom-${Date.now()}`;
        const newChallenge: Challenge = { id: challengeId, ...challenge };
        set((state) => ({
          customChallenges: [newChallenge, ...state.customChallenges],
        }));

        // Sync Supabase (avec file d'attente hors ligne)
        const userId = getUserId();
        if (userId) {
          const online = await isOnline();
          if (online) {
            challengeSync.upsertCustomChallenge(userId, newChallenge).catch(console.error);
          } else {
            queueOperation({
              type: 'challenge',
              action: 'create',
              data: { challenge: newChallenge, isCustom: true },
            }).catch(console.error);
          }
        }

        return challengeId;
      },

      getAllChallenges: () => [...CHALLENGES, ...get().customChallenges],

      getChallengeById: (challengeId) => {
        return get().getAllChallenges().find((c) => c.id === challengeId);
      },

      getActiveChallenge: (challengeId) => {
        return get().activeChallenges.find((c) => c.challengeId === challengeId && c.status === 'active');
      },

      isChallengeActive: (challengeId) => {
        return get().activeChallenges.some((c) => c.challengeId === challengeId && c.status === 'active');
      },

      isChallengeCompleted: (challengeId) => {
        return get().completedChallengeIds.includes(challengeId);
      },
    }),
    {
      name: 'challenge-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
