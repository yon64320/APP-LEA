import { requireSupabase } from '../../lib/supabase';
import { PremiumPlan } from '../../types';

export async function upsertPremium(
  userId: string,
  plan: PremiumPlan,
  expiresAt: string | null,
  streakProtectionsUsed: number,
  lastProtectionReset: string | null
): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('user_premium').upsert(
    {
      user_id: userId,
      plan,
      expires_at: expiresAt,
      streak_protections_used: streakProtectionsUsed,
      last_protection_reset: lastProtectionReset,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}

export async function fetchPremium(userId: string): Promise<{
  plan: PremiumPlan;
  expiresAt: string | null;
  streakProtectionsUsed: number;
  lastProtectionReset: string | null;
}> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('user_premium')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return {
    plan: (data?.plan as PremiumPlan) ?? 'free',
    expiresAt: data?.expires_at ?? null,
    streakProtectionsUsed: data?.streak_protections_used ?? 0,
    lastProtectionReset: data?.last_protection_reset ?? null,
  };
}
