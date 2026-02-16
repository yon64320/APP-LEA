export type HabitType = 'binary' | 'quantitative';

export type FrequencyType = 'daily' | 'weekly' | 'custom';

export type HabitCategory =
  | 'health'
  | 'sport'
  | 'productivity'
  | 'personal_development'
  | 'sleep'
  | 'reading';

export interface Frequency {
  type: FrequencyType;
  days: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday
}

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  frequency: Frequency;
  color: string;
  icon: string;
  createdAt: string;
  reminder?: {
    enabled: boolean;
    time: string; // HH:MM
  };
  note?: string;
  category?: HabitCategory;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
}

export interface DayCompletion {
  date: string;
  total: number;
  completed: number;
  rate: number;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompleted: number;
}

export interface PresetHabit {
  name: string;
  type: HabitType;
  target: number | null;
  unit: string | null;
  icon: string;
  color: string;
  category: HabitCategory;
  frequency: Frequency;
}

// ========== Gamification ==========

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: BadgeRequirement;
  unlockedAt?: string;
}

export interface BadgeRequirement {
  type: 'streak' | 'total_completions' | 'monthly_rate';
  value: number;
}

export interface XPEvent {
  amount: number;
  reason: string;
  date: string;
}

// ========== Challenges ==========

export type ChallengeStatus = 'available' | 'active' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  duration: number;
  habitConfig: {
    name: string;
    type: HabitType;
    target: number | null;
    unit: string | null;
  };
  category: HabitCategory;
}

export interface ActiveChallenge {
  challengeId: string;
  habitId: string;
  startDate: string;
  endDate: string;
  status: ChallengeStatus;
  completedDays: number;
}

// ========== Premium ==========

export type PremiumPlan = 'free' | 'monthly' | 'yearly';
