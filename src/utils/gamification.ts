import { HabitLog } from '../types';
import { useGamificationStore, XP_PER_HABIT } from '../store/gamificationStore';
import { useChallengeStore } from '../store/challengeStore';
import { useHabitStore } from '../store/habitStore';
import { calculateGlobalStreak } from './streak';
import { getMonthlyCompletions } from './stats';
import { getToday } from './date';

/**
 * Check and unlock badges based on current stats
 */
export function checkBadges(
  logs: HabitLog[],
  getHabitsForDate: (date: string) => Array<{ id: string }>
) {
  const gamificationStore = useGamificationStore.getState();
  const today = getToday();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Check streak badges
  const globalStreak = calculateGlobalStreak(logs, getHabitsForDate);
  if (globalStreak >= 7) gamificationStore.checkAndUnlockBadge('streak_7');
  if (globalStreak >= 30) gamificationStore.checkAndUnlockBadge('streak_30');
  if (globalStreak >= 100) gamificationStore.checkAndUnlockBadge('streak_100');

  // Check total completions badges
  const totalCompleted = logs.filter((l) => l.completed).length;
  if (totalCompleted >= 50) gamificationStore.checkAndUnlockBadge('total_50');
  if (totalCompleted >= 100) gamificationStore.checkAndUnlockBadge('total_100');
  if (totalCompleted >= 500) gamificationStore.checkAndUnlockBadge('total_500');

  // Check monthly rate badges
  // Note: getMonthlyCompletions needs full habits array, but we only need dates
  // For badge checking, we'll use a simplified approach
  const habits = useHabitStore.getState().habits;
  const completions = getMonthlyCompletions(
    year,
    month,
    habits,
    logs,
    (date: string) => {
      const dayOfWeek = new Date(date).getDay();
      return habits.filter((habit) => {
        if (habit.frequency.type === 'daily') return true;
        return habit.frequency.days.includes(dayOfWeek);
      });
    }
  );
  const withHabits = completions.filter((c) => c.total > 0);
  if (withHabits.length > 0) {
    const totalRate = withHabits.reduce((sum, c) => sum + c.rate, 0);
    const monthlyRate = totalRate / withHabits.length;
    if (monthlyRate >= 0.9) gamificationStore.checkAndUnlockBadge('monthly_90');
    if (monthlyRate >= 1.0) gamificationStore.checkAndUnlockBadge('monthly_100');
  }
}

/**
 * Update active challenges progress
 */
export function updateChallenges(
  habitId: string,
  date: string,
  completed: boolean
) {
  if (!completed) return;

  const challengeStore = useChallengeStore.getState();
  const activeChallenges = challengeStore.activeChallenges.filter(
    (ac) => ac.habitId === habitId && ac.status === 'active'
  );

  for (const activeChallenge of activeChallenges) {
    const start = new Date(activeChallenge.startDate + 'T00:00:00');
    const end = new Date(activeChallenge.endDate + 'T00:00:00');
    const current = new Date(date + 'T00:00:00');

    // Check if date is within challenge period
    if (current >= start && current <= end) {
      // Count completed days
      const logs = useHabitStore.getState().logs;
      const challengeLogs = logs.filter(
        (l) =>
          l.habitId === habitId &&
          l.completed &&
          l.date >= activeChallenge.startDate &&
          l.date <= activeChallenge.endDate
      );
      const uniqueDates = new Set(challengeLogs.map((l) => l.date));
      const completedDays = uniqueDates.size;

      challengeStore.updateChallengeProgress(
        activeChallenge.challengeId,
        completedDays
      );

      // Check if challenge is completed
      const challenge = CHALLENGES.find((c) => c.id === activeChallenge.challengeId);
      if (challenge && completedDays >= challenge.duration) {
        challengeStore.completeChallenge(activeChallenge.challengeId);
        // Bonus XP for completing challenge
        const gamificationStore = useGamificationStore.getState();
        gamificationStore.addXP(100, 'Défi complété');
      }
    }
  }
}

import { CHALLENGES } from '../constants/challenges';

/**
 * Handle gamification when a habit is completed
 */
export function handleHabitCompletion(
  habitId: string,
  date: string,
  completed: boolean,
  logs: HabitLog[],
  getHabitsForDate: (date: string) => { id: string }[]
) {
  if (completed) {
    // Add XP for completing habit
    const gamificationStore = useGamificationStore.getState();
    gamificationStore.addXP(XP_PER_HABIT, 'Habitude complétée');

    // Check badges
    checkBadges(logs, getHabitsForDate);

    // Update challenges
    updateChallenges(habitId, date, completed);
  }
}
