import { supabase, isSupabaseConfigured, requireSupabase } from '../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

let habitsChannel: RealtimeChannel | null = null;
let logsChannel: RealtimeChannel | null = null;
let gamificationChannel: RealtimeChannel | null = null;
let challengesChannel: RealtimeChannel | null = null;

/**
 * Initialise les abonnements temps réel pour synchroniser automatiquement
 * les changements depuis d'autres appareils
 */
export function subscribeToRealtime(userId: string): void {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase non configuré, abonnements temps réel désactivés');
    return;
  }

  // Désabonner des canaux existants
  unsubscribeFromRealtime();

  const client = requireSupabase();

  // Abonnement aux habitudes
  habitsChannel = client
    .channel(`habits:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useHabitStore } = require('../../store/habitStore');
        const { fetchHabits } = require('./habitSync');

        // Recharger les habitudes depuis Supabase
        const { habits } = await fetchHabits(userId);
        useHabitStore.setState({ habits });
      }
    )
    .subscribe();

  // Abonnement aux logs
  logsChannel = client
    .channel(`logs:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habit_logs',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useHabitStore } = require('../../store/habitStore');
        const { fetchHabits } = require('./habitSync');

        // Recharger les logs depuis Supabase
        const { logs } = await fetchHabits(userId);
        useHabitStore.setState({ logs });
      }
    )
    .subscribe();

  // Abonnement à la gamification
  gamificationChannel = client
    .channel(`gamification:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_gamification',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useGamificationStore } = require('../../store/gamificationStore');
        const { fetchGamification } = require('./gamificationSync');

        // Recharger la gamification depuis Supabase
        const gamData = await fetchGamification(userId);
        useGamificationStore.setState({
          xp: gamData.xp,
          level: gamData.level,
          totalXP: gamData.totalXP,
          unlockedBadges: gamData.unlockedBadges,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_badges',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useGamificationStore } = require('../../store/gamificationStore');
        const { fetchGamification } = require('./gamificationSync');

        // Recharger les badges depuis Supabase
        const gamData = await fetchGamification(userId);
        useGamificationStore.setState({
          unlockedBadges: gamData.unlockedBadges,
        });
      }
    )
    .subscribe();

  // Abonnement aux challenges
  challengesChannel = client
    .channel(`challenges:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_challenges',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useChallengeStore } = require('../../store/challengeStore');
        const { fetchChallenges } = require('./challengeSync');

        // Recharger les challenges depuis Supabase
        const challengesData = await fetchChallenges(userId);
        useChallengeStore.setState({
          activeChallenges: challengesData.activeChallenges,
          completedChallengeIds: challengesData.completedChallengeIds,
          customChallenges: challengesData.customChallenges,
        });
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'completed_challenges',
        filter: `user_id=eq.${userId}`,
      },
      async (payload) => {
        const { useChallengeStore } = require('../../store/challengeStore');
        const { fetchChallenges } = require('./challengeSync');

        // Recharger les challenges depuis Supabase
        const challengesData = await fetchChallenges(userId);
        useChallengeStore.setState({
          completedChallengeIds: challengesData.completedChallengeIds,
        });
      }
    )
    .subscribe();
}

/**
 * Désabonne de tous les canaux temps réel
 */
export function unsubscribeFromRealtime(): void {
  if (!isSupabaseConfigured()) return;
  
  const client = requireSupabase();
  
  if (habitsChannel) {
    client.removeChannel(habitsChannel);
    habitsChannel = null;
  }
  if (logsChannel) {
    client.removeChannel(logsChannel);
    logsChannel = null;
  }
  if (gamificationChannel) {
    client.removeChannel(gamificationChannel);
    gamificationChannel = null;
  }
  if (challengesChannel) {
    client.removeChannel(challengesChannel);
    challengesChannel = null;
  }
}
