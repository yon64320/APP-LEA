import { fetchHabits, pushAllHabits } from './habitSync';
import { fetchGamification, pushAllGamification } from './gamificationSync';
import { fetchChallenges, pushAllChallenges } from './challengeSync';
import { fetchPremium, upsertPremium } from './premiumSync';
import { requireSupabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Charge toutes les données utilisateur depuis Supabase et popule les stores Zustand.
 * Appelé après une connexion réussie.
 */
export async function pullUserData(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase non configuré, pullUserData ignoré');
    return;
  }

  const { useHabitStore } = require('../../store/habitStore');
  const { useGamificationStore } = require('../../store/gamificationStore');
  const { useChallengeStore } = require('../../store/challengeStore');
  const { usePremiumStore } = require('../../store/premiumStore');
  const { useAppStore } = require('../../store/appStore');

  try {
    const [habitsData, gamData, challengesData, premiumData, profileData] = await Promise.all([
      fetchHabits(userId),
      fetchGamification(userId),
      fetchChallenges(userId),
      fetchPremium(userId),
      requireSupabase().from('profiles').select('user_name').eq('id', userId).single(),
    ]);

    useHabitStore.setState({
      habits: habitsData.habits,
      logs: habitsData.logs,
    });

    useGamificationStore.setState({
      xp: gamData.xp,
      level: gamData.level,
      totalXP: gamData.totalXP,
      unlockedBadges: gamData.unlockedBadges,
      xpHistory: gamData.xpHistory,
    });

    useChallengeStore.setState({
      activeChallenges: challengesData.activeChallenges,
      completedChallengeIds: challengesData.completedChallengeIds,
      customChallenges: challengesData.customChallenges,
    });

    usePremiumStore.setState({
      plan: premiumData.plan,
      expiresAt: premiumData.expiresAt,
      streakProtectionsUsed: premiumData.streakProtectionsUsed,
      lastProtectionReset: premiumData.lastProtectionReset,
    });

    if (profileData.data?.user_name) {
      useAppStore.setState({ userName: profileData.data.user_name });
    }

    // Marquer onboarding comme fait si l'utilisateur a déjà des habitudes
    if (habitsData.habits.length > 0) {
      useAppStore.setState({ hasCompletedOnboarding: true });
    }
  } catch (e) {
    console.error('pullUserData error:', e);
  }
}

/**
 * Pousse toutes les données locales vers Supabase.
 * Utilisé lors de la première connexion d'un utilisateur existant (migration locale → cloud).
 */
export async function pushAllLocalData(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase non configuré, pushAllLocalData ignoré');
    return;
  }

  const { useHabitStore } = require('../../store/habitStore');
  const { useGamificationStore } = require('../../store/gamificationStore');
  const { useChallengeStore } = require('../../store/challengeStore');
  const { usePremiumStore } = require('../../store/premiumStore');

  try {
    const { habits, logs } = useHabitStore.getState();
    const { xp, level, totalXP, unlockedBadges, xpHistory } = useGamificationStore.getState();
    const { activeChallenges, completedChallengeIds, customChallenges } = useChallengeStore.getState();
    const { plan, expiresAt, streakProtectionsUsed, lastProtectionReset } = usePremiumStore.getState();

    await Promise.all([
      pushAllHabits(habits, logs, userId),
      pushAllGamification(userId, xp, level, totalXP, unlockedBadges, xpHistory),
      pushAllChallenges(userId, activeChallenges, completedChallengeIds, customChallenges),
      upsertPremium(userId, plan, expiresAt, streakProtectionsUsed, lastProtectionReset),
    ]);
  } catch (e) {
    console.error('pushAllLocalData error:', e);
  }
}
