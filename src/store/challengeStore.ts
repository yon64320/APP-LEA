import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveChallenge, Challenge, ChallengeStatus } from '../types';
import { getToday, addDays } from '../utils/date';
import { CHALLENGES } from '../constants/challenges';

interface ChallengeState {
  activeChallenges: ActiveChallenge[];
  completedChallengeIds: string[];
  customChallenges: Challenge[];

  startChallenge: (challengeId: string, habitId: string, duration: number) => void;
  updateChallengeProgress: (challengeId: string, completedDays: number) => void;
  completeChallenge: (challengeId: string) => void;
  failChallenge: (challengeId: string) => void;
  abandonChallenge: (challengeId: string) => void;
  addCustomChallenge: (challenge: Omit<Challenge, 'id'>) => string;
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

      startChallenge: (challengeId, habitId, duration) => {
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
      },

      updateChallengeProgress: (challengeId, completedDays) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.challengeId === challengeId ? { ...c, completedDays } : c
          ),
        }));
      },

      completeChallenge: (challengeId) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.challengeId === challengeId
              ? { ...c, status: 'completed' as ChallengeStatus }
              : c
          ),
          completedChallengeIds: [...new Set([...state.completedChallengeIds, challengeId])],
        }));
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

      addCustomChallenge: (challenge) => {
        const challengeId = `custom-${Date.now()}`;
        set((state) => ({
          customChallenges: [{ id: challengeId, ...challenge }, ...state.customChallenges],
        }));
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
