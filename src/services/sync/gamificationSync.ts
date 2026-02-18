import { requireSupabase } from '../../lib/supabase';
import { Badge, XPEvent } from '../../types';

export async function upsertGamification(
  userId: string,
  xp: number,
  level: number,
  totalXP: number
): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('user_gamification').upsert(
    { user_id: userId, xp, level, total_xp: totalXP, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

export async function upsertBadge(userId: string, badge: Badge): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('user_badges').upsert(
    {
      user_id: userId,
      badge_id: badge.id,
      unlocked_at: badge.unlockedAt ?? new Date().toISOString(),
    },
    { onConflict: 'user_id,badge_id' }
  );
  if (error) throw error;
}

export async function insertXPEvent(userId: string, event: XPEvent): Promise<void> {
  // Note: xp_history est optionnel, on peut stocker l'historique localement
  // Si vous voulez le stocker dans Supabase, ajoutez la table xp_history au schéma
  // Pour l'instant, on ne stocke que les stats principales
  // L'historique XP reste local (dans le store Zustand)
}

export async function fetchGamification(userId: string): Promise<{
  xp: number;
  level: number;
  totalXP: number;
  unlockedBadges: Badge[];
  xpHistory: XPEvent[];
}> {
  const supabase = requireSupabase();
  const [gamResult, badgesResult] = await Promise.all([
    supabase.from('user_gamification').select('*').eq('user_id', userId).single(),
    supabase.from('user_badges').select('*').eq('user_id', userId),
  ]);

  const gam = gamResult.data;
  
  // Récupérer les définitions de badges pour compléter les infos
  const { BADGE_DEFINITIONS } = require('../../store/gamificationStore');
  const badges: Badge[] = (badgesResult.data ?? []).map((row) => {
    const definition = BADGE_DEFINITIONS.find((b: any) => b.id === row.badge_id);
    if (!definition) {
      // Badge inconnu, retourner un badge minimal
      return {
        id: row.badge_id,
        name: row.badge_id,
        description: '',
        icon: 'star',
        color: '#800000',
        requirement: { type: 'streak' as const, value: 0 },
        unlockedAt: row.unlocked_at,
      };
    }
    return {
      ...definition,
      unlockedAt: row.unlocked_at,
    };
  });

  // L'historique XP reste local (pas stocké dans Supabase pour l'instant)
  const xpHistory: XPEvent[] = [];

  return {
    xp: gam?.xp ?? 0,
    level: gam?.level ?? 1,
    totalXP: gam?.total_xp ?? 0,
    unlockedBadges: badges,
    xpHistory,
  };
}

export async function pushAllGamification(
  userId: string,
  xp: number,
  level: number,
  totalXP: number,
  unlockedBadges: Badge[],
  xpHistory: XPEvent[]
): Promise<void> {
  await upsertGamification(userId, xp, level, totalXP);

  if (unlockedBadges.length > 0) {
    const badgeRows = unlockedBadges.map((b) => ({
      user_id: userId,
      badge_id: b.id,
      unlocked_at: b.unlockedAt ?? new Date().toISOString(),
    }));
    const supabase = requireSupabase();
    const { error } = await supabase.from('user_badges').upsert(badgeRows, {
      onConflict: 'user_id,badge_id',
    });
    if (error) throw error;
  }

  // L'historique XP reste local (pas stocké dans Supabase pour l'instant)
  // Si vous voulez le stocker, ajoutez la table xp_history au schéma SQL
}
