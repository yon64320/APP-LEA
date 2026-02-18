import { requireSupabase } from '../../lib/supabase';
import { ActiveChallenge, Challenge } from '../../types';

export async function upsertActiveChallenge(userId: string, challenge: ActiveChallenge): Promise<void> {
  const supabase = requireSupabase();
  // Vérifier si un challenge actif existe déjà
  const { data: existing } = await supabase
    .from('active_challenges')
    .select('id')
    .eq('user_id', userId)
    .eq('challenge_id', challenge.challengeId)
    .single();

  const challengeData = {
    user_id: userId,
    challenge_id: challenge.challengeId,
    habit_id: challenge.habitId,
    start_date: challenge.startDate,
    end_date: challenge.endDate,
    status: challenge.status,
    completed_days: challenge.completedDays,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('active_challenges')
      .update(challengeData)
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabase.from('active_challenges').insert(challengeData);
    if (error) throw error;
  }
}

export async function upsertCompletedChallenge(userId: string, challengeId: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('completed_challenges').upsert(
    { user_id: userId, challenge_id: challengeId },
    { onConflict: 'user_id,challenge_id' }
  );
  if (error) throw error;
}

export async function upsertCustomChallenge(userId: string, challenge: Challenge): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('custom_challenges').upsert({
    id: challenge.id,
    user_id: userId,
    name: challenge.name,
    description: challenge.description,
    icon: challenge.icon,
    color: challenge.color,
    duration: challenge.duration,
    habit_config: challenge.habitConfig,
    category: challenge.category,
  });
  if (error) throw error;
}

export async function fetchChallenges(userId: string): Promise<{
  activeChallenges: ActiveChallenge[];
  completedChallengeIds: string[];
  customChallenges: Challenge[];
}> {
  const supabase = requireSupabase();
  const [activeResult, completedResult, customResult] = await Promise.all([
    supabase.from('active_challenges').select('*').eq('user_id', userId),
    supabase.from('completed_challenges').select('challenge_id').eq('user_id', userId),
    supabase.from('custom_challenges').select('*').eq('user_id', userId),
  ]);

  const activeChallenges: ActiveChallenge[] = (activeResult.data ?? []).map((row) => ({
    challengeId: row.challenge_id,
    habitId: row.habit_id,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    completedDays: row.completed_days,
  }));

  const completedChallengeIds: string[] = (completedResult.data ?? []).map((row) => row.challenge_id);

  const customChallenges: Challenge[] = (customResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    duration: row.duration,
    habitConfig: row.habit_config,
    category: row.category,
  }));

  return { activeChallenges, completedChallengeIds, customChallenges };
}

export async function pushAllChallenges(
  userId: string,
  activeChallenges: ActiveChallenge[],
  completedChallengeIds: string[],
  customChallenges: Challenge[]
): Promise<void> {
  if (activeChallenges.length > 0) {
    const rows = activeChallenges.map((c) => ({
      user_id: userId,
      challenge_id: c.challengeId,
      habit_id: c.habitId,
      start_date: c.startDate,
      end_date: c.endDate,
      status: c.status,
      completed_days: c.completedDays,
    }));
    const supabase = requireSupabase();
    const { error } = await supabase.from('active_challenges').upsert(rows, {
      onConflict: 'user_id,challenge_id',
    });
    if (error) throw error;
  }

  if (completedChallengeIds.length > 0) {
    const rows = completedChallengeIds.map((id) => ({ user_id: userId, challenge_id: id }));
    const supabase = requireSupabase();
    const { error } = await supabase.from('completed_challenges').upsert(rows, {
      onConflict: 'user_id,challenge_id',
    });
    if (error) throw error;
  }

  if (customChallenges.length > 0) {
    const rows = customChallenges.map((c) => ({
      id: c.id,
      user_id: userId,
      name: c.name,
      description: c.description,
      icon: c.icon,
      color: c.color,
      duration: c.duration,
      habit_config: c.habitConfig,
      category: c.category,
    }));
    const supabase = requireSupabase();
    const { error } = await supabase.from('custom_challenges').upsert(rows);
    if (error) throw error;
  }
}
