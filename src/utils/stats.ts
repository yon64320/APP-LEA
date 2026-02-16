import { Habit, HabitLog, HabitStats, DayCompletion } from '../types';
import { formatDate, getDaysInMonth } from './date';
import { calculateCurrentStreak, calculateBestStreak } from './streak';

export function getHabitStats(
  habit: Habit,
  logs: HabitLog[]
): HabitStats {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const completedLogs = habitLogs.filter((l) => l.completed);

  return {
    currentStreak: calculateCurrentStreak(logs, habit.id),
    bestStreak: calculateBestStreak(logs, habit.id),
    completionRate:
      habitLogs.length > 0 ? completedLogs.length / habitLogs.length : 0,
    totalCompleted: completedLogs.length,
  };
}

export function getMonthlyCompletions(
  year: number,
  month: number,
  habits: Habit[],
  logs: HabitLog[],
  getHabitsForDate: (date: string) => Habit[]
): DayCompletion[] {
  const daysInMonth = getDaysInMonth(year, month);
  const completions: DayCompletion[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDate(new Date(year, month, day));
    const dayHabits = getHabitsForDate(date);
    const dayLogs = logs.filter((l) => l.date === date);
    const completed = dayHabits.filter((h) =>
      dayLogs.some((l) => l.habitId === h.id && l.completed)
    ).length;

    completions.push({
      date,
      total: dayHabits.length,
      completed,
      rate: dayHabits.length > 0 ? completed / dayHabits.length : 0,
    });
  }

  return completions;
}

export function getOverallCompletionRate(
  logs: HabitLog[],
  totalExpected: number
): number {
  if (totalExpected === 0) return 0;
  const completed = logs.filter((l) => l.completed).length;
  return completed / totalExpected;
}
