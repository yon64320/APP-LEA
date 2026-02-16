import { HabitLog } from '../types';
import { getToday, addDays } from './date';

export function calculateCurrentStreak(logs: HabitLog[], habitId: string): number {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.date)
    .sort()
    .reverse();

  if (habitLogs.length === 0) return 0;

  let streak = 0;
  let checkDate = getToday();

  // If today isn't completed, start from yesterday
  if (!habitLogs.includes(checkDate)) {
    checkDate = addDays(checkDate, -1);
  }

  while (habitLogs.includes(checkDate)) {
    streak++;
    checkDate = addDays(checkDate, -1);
  }

  return streak;
}

export function calculateBestStreak(logs: HabitLog[], habitId: string): number {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId && l.completed)
    .map((l) => l.date)
    .sort();

  if (habitLogs.length === 0) return 0;

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < habitLogs.length; i++) {
    const expected = addDays(habitLogs[i - 1], 1);
    if (habitLogs[i] === expected) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return bestStreak;
}

export function calculateGlobalStreak(
  logs: HabitLog[],
  getHabitsForDate: (date: string) => { id: string }[]
): number {
  let streak = 0;
  let checkDate = getToday();

  // Check if today is fully complete; if not, start from yesterday
  const todayHabits = getHabitsForDate(checkDate);
  if (todayHabits.length > 0) {
    const todayCompleted = todayHabits.every((h) =>
      logs.some((l) => l.habitId === h.id && l.date === checkDate && l.completed)
    );
    if (!todayCompleted) {
      checkDate = addDays(checkDate, -1);
    }
  }

  while (true) {
    const dayHabits = getHabitsForDate(checkDate);
    if (dayHabits.length === 0) {
      checkDate = addDays(checkDate, -1);
      continue;
    }

    const allCompleted = dayHabits.every((h) =>
      logs.some((l) => l.habitId === h.id && l.date === checkDate && l.completed)
    );

    if (allCompleted) {
      streak++;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }

    // Safety limit
    if (streak > 1000) break;
  }

  return streak;
}
