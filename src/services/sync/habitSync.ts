import { requireSupabase } from '../../lib/supabase';
import { Habit, HabitLog } from '../../types';

// Synchronise une habitude vers Supabase (upsert)
export async function upsertHabit(habit: Habit, userId: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('habits').upsert({
    id: habit.id,
    user_id: userId,
    name: habit.name,
    type: habit.type,
    target: habit.target,
    unit: habit.unit,
    color: habit.color,
    icon: habit.icon,
    category: habit.category ?? null,
    frequency: habit.frequency,
    reminder: habit.reminder ?? null,
    note: habit.note ?? null,
    created_at: habit.createdAt,
  });
  if (error) throw error;
}

// Suppression d'une habitude
export async function deleteHabit(habitId: string, userId: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);
  if (error) throw error;
}

// Synchronise un log d'habitude (upsert sur habit_id + date)
export async function upsertHabitLog(log: HabitLog, userId: string, habitId: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from('habit_logs').upsert(
    {
      user_id: userId,
      habit_id: habitId,
      date: log.date,
      value: log.value,
      completed: log.completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'habit_id,date' }
  );
  if (error) throw error;
}

// Charge toutes les habitudes et logs depuis Supabase
export async function fetchHabits(userId: string): Promise<{ habits: Habit[]; logs: HabitLog[] }> {
  const supabase = requireSupabase();
  const [habitsResult, logsResult] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId),
    supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId),
  ]);

  if (habitsResult.error) throw habitsResult.error;
  if (logsResult.error) throw logsResult.error;

  const habits: Habit[] = (habitsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    target: row.target,
    unit: row.unit,
    color: row.color,
    icon: row.icon,
    category: row.category,
    frequency: row.frequency,
    reminder: row.reminder,
    note: row.note,
    createdAt: row.created_at,
  }));

  const logs: HabitLog[] = (logsResult.data ?? []).map((row) => ({
    habitId: row.habit_id,
    date: row.date,
    value: row.value,
    completed: row.completed,
  }));

  return { habits, logs };
}

// Pousse toutes les habitudes + logs locaux vers Supabase (première connexion)
export async function pushAllHabits(habits: Habit[], logs: HabitLog[], userId: string): Promise<void> {
  if (habits.length === 0) return;
  const supabase = requireSupabase();

  const habitRows = habits.map((h) => ({
    id: h.id,
    user_id: userId,
    name: h.name,
    type: h.type,
    target: h.target,
    unit: h.unit,
    color: h.color,
    icon: h.icon,
    category: h.category ?? null,
    frequency: h.frequency,
    reminder: h.reminder ?? null,
    note: h.note ?? null,
    created_at: h.createdAt,
  }));

  const { error: habitsError } = await supabase.from('habits').upsert(habitRows);
  if (habitsError) throw habitsError;

  if (logs.length === 0) return;

  const logRows = logs.map((l) => ({
    user_id: userId,
    habit_id: l.habitId,
    date: l.date,
    value: l.value,
    completed: l.completed,
  }));

  const { error: logsError } = await supabase.from('habit_logs').upsert(logRows, {
    onConflict: 'habit_id,date',
  });
  if (logsError) throw logsError;
}
